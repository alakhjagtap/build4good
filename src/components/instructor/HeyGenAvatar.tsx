"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from "livekit-client";
import { Loader2, WifiOff } from "lucide-react";
import { prepareSpeechText } from "@/lib/latex-filter";
import { speak as browserSpeak, cancelSpeech } from "@/lib/speech";

export type HeyGenAvatarHandle = {
  isLive: () => boolean;
  isSpeaking: () => boolean;
  unlockAudio: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
};

type SessionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "fallback"
  | "error"
  | "no-key";

function isConcurrencyError(msg: string, code?: unknown): boolean {
  if (code === 4032) return true;
  return /4032|concurrency|Session concurrency limit/i.test(msg);
}

const AGENT_CONTROL_TOPIC = "agent-control";

type HeyGenAvatarProps = {
  onAvatarReady?: () => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
};

const HeyGenAvatar = forwardRef<HeyGenAvatarHandle, HeyGenAvatarProps>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const statusRef = useRef<SessionStatus>("idle");
  statusRef.current = status;
  const sessionIdRef = useRef<string>("");
  const [speaking, setSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onAvatarReadyRef = useRef(props.onAvatarReady);
  const onSpeakingChangeRef = useRef(props.onSpeakingChange);
  useEffect(() => {
    onAvatarReadyRef.current = props.onAvatarReady;
    onSpeakingChangeRef.current = props.onSpeakingChange;
  }, [props.onAvatarReady, props.onSpeakingChange]);

  const publishCommand = useCallback(
    (eventType: string, data: Record<string, unknown> = {}) => {
      const room = roomRef.current;
      if (!room?.localParticipant) return;

      const payload = {
        event_id: crypto.randomUUID(),
        event_type: eventType,
        session_id: sessionIdRef.current,
        ...data,
      };
      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      room.localParticipant
        .publishData(encoded, {
          reliable: true,
          topic: AGENT_CONTROL_TOPIC,
        })
        .catch((err: unknown) =>
          console.warn("[LiveAvatar] publish failed:", err),
        );
    },
    [],
  );

  const stopServerSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    try {
      await fetch("/api/avatar/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      });
    } catch {
      /* best-effort */
    }
    sessionIdRef.current = "";
  }, []);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect().catch(() => {});
      roomRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    await stopServerSession();
    setStatus("idle");
    setSpeaking(false);
  }, [stopServerSession]);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/avatar/session", { method: "POST" });
      const raw = await res.text();
      let json: Record<string, unknown> = {};
      if (raw.trim()) {
        try {
          json = JSON.parse(raw) as Record<string, unknown>;
        } catch (parseErr) {
          console.error("[LiveAvatar] avatar/session returned non-JSON:", raw.slice(0, 180));
          throw new Error(
            `Invalid avatar session response (status ${res.status}): ${String(parseErr)}`,
          );
        }
      }

      if (!res.ok) {
        const errText =
          typeof json.error === "string"
            ? json.error
            : "Failed to create avatar session";
        if (/API_KEY|not configured/i.test(errText)) {
          setStatus("no-key");
          return;
        }
        if (isConcurrencyError(errText, json.code)) {
          console.warn("[LiveAvatar] concurrency limit — using voice-only fallback");
          setStatus("fallback");
          setErrorMsg("");
          onAvatarReadyRef.current?.();
          return;
        }
        throw new Error(errText);
      }

      const { session_id, livekit_url, livekit_token } = json as {
        session_id: string;
        livekit_url: string;
        livekit_token: string;
      };
      if (!session_id || !livekit_url || !livekit_token) {
        throw new Error("Avatar session response missing required fields.");
      }

      sessionIdRef.current = session_id;

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      const attachTrack = (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current);
          videoRef.current.muted = false;
          void videoRef.current.play().catch((err) => {
            console.warn("[LiveAvatar] video autoplay pending user gesture:", err);
          });
        }
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.attach(audioRef.current);
          audioRef.current.muted = false;
          void audioRef.current.play().catch((err) => {
            console.warn("[LiveAvatar] audio autoplay pending user gesture:", err);
          });
        }
      };

      room.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          _participant: RemoteParticipant,
        ) => {
          attachTrack(track);
        },
      );

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        participant.trackPublications.forEach((pub) => {
          if (pub.track) attachTrack(pub.track as RemoteTrack);
        });
      });

      room.on(RoomEvent.DataReceived, (data: Uint8Array) => {
        try {
          const evt = JSON.parse(new TextDecoder().decode(data)) as {
            event_type?: string;
          };
          if (evt.event_type === "avatar.speak_started") {
            setSpeaking(true);
            onSpeakingChangeRef.current?.(true);
          }
          if (evt.event_type === "avatar.speak_ended") {
            setSpeaking(false);
            onSpeakingChangeRef.current?.(false);
          }
          if (evt.event_type === "session.stopped") void disconnect();
        } catch {
          // non-JSON data, ignore
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        setStatus("idle");
        setSpeaking(false);
      });

      await room.connect(livekit_url, livekit_token, { autoSubscribe: true });

      // Attach any tracks already published before we subscribed
      room.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((pub) => {
          if (pub.track) attachTrack(pub.track as RemoteTrack);
        });
      });

      statusRef.current = "connected";
      setStatus("connected");
      onAvatarReadyRef.current?.();
    } catch (err) {
      const msg = (err as Error).message;
      console.error("[LiveAvatar] connect error:", msg);
      if (/API_KEY|not configured/i.test(msg)) {
        setStatus("no-key");
        setErrorMsg("");
        return;
      }
      if (isConcurrencyError(msg, undefined)) {
        console.warn("[LiveAvatar] concurrency — voice-only fallback");
        setStatus("fallback");
        setErrorMsg("");
        onAvatarReadyRef.current?.();
        return;
      }
      setStatus("error");
      setErrorMsg(msg);
      if (roomRef.current) {
        await roomRef.current.disconnect().catch(() => {});
        roomRef.current = null;
      }
    }
  }, [disconnect]);

  useEffect(() => {
    void connect();
    return () => {
      void disconnect();
    };
  }, [connect, disconnect]);

  // Unlock audio on first user interaction
  useEffect(() => {
    if (status !== "connected") return;
    const unlock = () => {
      const a = audioRef.current;
      if (a) {
        a.muted = false;
        void a.play().catch(() => {});
      }
      const v = videoRef.current;
      if (v) {
        v.muted = false;
        void v.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [status]);

  useImperativeHandle(ref, () => ({
    isLive: () =>
      statusRef.current === "connected" || statusRef.current === "fallback",
    isSpeaking: () => speaking,
    unlockAudio: async () => {
      if (statusRef.current === "fallback") return;
      const a = audioRef.current;
      if (a) {
        a.muted = false;
        await a.play();
      }
      const v = videoRef.current;
      if (v) {
        v.muted = false;
        await v.play().catch(() => {});
      }
    },
    speak: async (text: string) => {
      if (!text.trim()) {
        throw new Error("Speak called with empty text");
      }
      if (statusRef.current === "fallback") {
        const speechText = prepareSpeechText(text);
        if (!speechText.trim()) {
          throw new Error("Speech text empty after preprocessing");
        }
        setSpeaking(true);
        onSpeakingChangeRef.current?.(true);
        try {
          await browserSpeak(speechText);
        } finally {
          setSpeaking(false);
          onSpeakingChangeRef.current?.(false);
        }
        return;
      }
      if (statusRef.current !== "connected") {
        const beforeRetry = statusRef.current;
        console.warn("[LiveAvatar] speak called but status is", beforeRetry, "retrying");
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (statusRef.current !== "connected") {
        throw new Error(`Avatar not connected (${statusRef.current})`);
      }
      const speechText = prepareSpeechText(text);
      if (!speechText.trim()) {
        throw new Error("Speech text empty after preprocessing");
      }
      await (async () => {
        const a = audioRef.current;
        if (a) {
          a.muted = false;
          await a.play().catch(() => {});
        }
      })();
      console.log("[LiveAvatar] speaking:", speechText.slice(0, 60));
      publishCommand("avatar.speak_text", { text: speechText });
    },
    interrupt: async () => {
      if (statusRef.current === "fallback") {
        cancelSpeech();
        return;
      }
      if (statusRef.current !== "connected") return;
      console.log("[LiveAvatar] interrupt");
      publishCommand("avatar.interrupt");
    },
  }));

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          status === "connected" ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Hidden audio element for avatar speech */}
      <audio ref={audioRef} autoPlay playsInline />

      {status === "fallback" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-black px-5 text-center">
          <div className="text-3xl font-semibold text-white/90 tracking-tight">∑</div>
          <p className="text-[11px] font-medium text-indigo-100/95 leading-snug">
            Live video is off (session limit or plan). Audio tutor is on — ask questions by voice.
          </p>
        </div>
      )}

      {status !== "connected" && status !== "fallback" && (
        <div className="flex flex-col items-center gap-3 text-gray-400 px-4 text-center z-10">
          {status === "connecting" ? (
            <>
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <p className="text-xs text-gray-400">
                Connecting to AI tutor...
              </p>
            </>
          ) : status === "no-key" ? (
            <p className="text-xs text-gray-400 leading-relaxed">
              Set{" "}
              <span className="font-mono text-gray-300">HEYGEN_API_KEY</span>{" "}
              in <span className="font-mono text-gray-300">.env.local</span>
            </p>
          ) : status === "error" ? (
            <>
              <WifiOff className="w-5 h-5 text-red-400" />
              <p className="text-[11px] text-red-300/80 leading-relaxed max-w-[200px] break-all">
                {errorMsg}
              </p>
              <button
                type="button"
                onClick={() => void connect()}
                className="px-3 py-1.5 rounded text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 mt-2"
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center">
                <span className="text-lg">AI</span>
              </div>
              <p className="text-xs text-gray-500">AI Instructor</p>
            </>
          )}
        </div>
      )}

      {(status === "connected" || status === "fallback") && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded z-10">
          <span
            className={`w-1.5 h-1.5 rounded-full ${speaking ? "bg-green-400 animate-pulse" : "bg-amber-400 animate-pulse"}`}
          />
          {status === "fallback"
            ? speaking
              ? "SPEAKING"
              : "VOICE"
            : speaking
              ? "SPEAKING"
              : "LIVE"}
        </div>
      )}
    </div>
  );
});

HeyGenAvatar.displayName = "HeyGenAvatar";
export default HeyGenAvatar;
