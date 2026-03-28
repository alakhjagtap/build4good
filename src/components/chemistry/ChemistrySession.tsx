"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type FormEvent,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Droplets,
  RotateCcw,
  FlaskConical,
  VideoOff,
  ChevronDown,
  ChevronUp,
  Gauge,
} from "lucide-react";
import {
  startContinuousListening,
  stopContinuousListening,
  cancelSpeech,
} from "@/lib/speech";
import type { HeyGenAvatarHandle } from "@/components/instructor/HeyGenAvatar";
import type { TitrationHandle } from "./TitrationSetup";

const HeyGenAvatar = dynamic(
  () => import("@/components/instructor/HeyGenAvatar"),
  { ssr: false },
);
const LabEnvironment = dynamic(() => import("./LabEnvironment"), {
  ssr: false,
});
const TitrationSetup = dynamic(() => import("./TitrationSetup"), {
  ssr: false,
});

/* ─── types ─── */

type ChatMsg = { role: "user" | "ai" | "system"; text: string };

type TutorResponse = {
  reply: string;
  action: string;
  hint: string | null;
};

type ConvState =
  | "CONNECTING"
  | "INITIAL"
  | "WAITING_FOR_INPUT"
  | "LISTENING"
  | "LAB_REQUESTED"
  | "DEMO_LOADING"
  | "DEMO_ACTIVE";

/* ─── intent keywords ─── */

const TITRATION_KEYWORDS = [
  "titration",
  "acid",
  "base",
  "reaction",
  "demo",
  "show me",
  "try it",
  "interactive",
  "burette",
  "flask",
  "phenolphthalein",
  "indicator",
  "neutrali",
  "equivalence",
  "ph",
  "sodium hydroxide",
  "hydrochloric",
  "hcl",
  "naoh",
];

const GENERAL_LAB_KEYWORDS = [
  "lab",
  "experiment",
  "lab help",
  "lab board",
  "practical",
  "procedure",
];

function detectTitrationIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return TITRATION_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectGeneralLabIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return GENERAL_LAB_KEYWORDS.some((kw) => lower.includes(kw));
}

/* ─── tutor API ─── */

async function askChemTutor(
  message: string,
  labState: { drops: number; volume: number; ph: number; color: string } | null,
  history: ChatMsg[],
): Promise<TutorResponse> {
  try {
    const res = await fetch("/api/chemistry-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        labState,
        conversationHistory: history.slice(-8).map((m) => ({
          role: m.role === "ai" ? "assistant" : "student",
          text: m.text,
        })),
      }),
    });
    const data = (await res.json()) as TutorResponse & { error?: string };
    if (!res.ok || !data.reply) {
      return {
        reply: data.error ?? "Sorry, could you try saying that again?",
        action: "none",
        hint: null,
      };
    }
    return data;
  } catch {
    return {
      reply: "Having trouble connecting. Try again in a moment.",
      action: "none",
      hint: null,
    };
  }
}

/* ─── connecting screen ─── */

const CONNECTING_MSGS = [
  "Your session is almost ready!",
  "Preparing your tutor",
  "Getting video and audio ready",
  "Launching your live lesson",
];

function ConnectingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((p) => (p + 1) % CONNECTING_MSGS.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 z-50 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.22),transparent_38%),radial-gradient(circle_at_80%_5%,rgba(56,189,248,0.18),transparent_35%),#05070f] flex items-center justify-center">
      <div className="text-center px-6">
        <div className="relative mx-auto mb-8 h-24 w-24">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-emerald-300/25"
              animate={{ scale: [0.82, 1.35], opacity: [0.6, 0] }}
              transition={{
                duration: 1.9,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.45,
              }}
            />
          ))}
          <div className="absolute inset-0 m-auto h-3.5 w-3.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Connecting
        </h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.9, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-emerald-100/90 text-sm sm:text-base"
          >
            {CONNECTING_MSGS[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function ChemistrySession({ onEnd }: { onEnd: () => void }) {
  /* ── state ── */
  const [convState, setConvState] = useState<ConvState>("CONNECTING");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [textInput, setTextInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [labEnabled, setLabEnabled] = useState(false);
  const [pourRate, setPourRate] = useState(1);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  /* ── refs ── */
  const avatarRef = useRef<HeyGenAvatarHandle>(null);
  const titrationRef = useRef<TitrationHandle>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userCamRef = useRef<HTMLVideoElement>(null);
  const thinkingRef = useRef(false);
  const convStateRef = useRef<ConvState>("CONNECTING");
  const labFallbackPromptCountRef = useRef(0);
  const greetingSentRef = useRef(false);

  thinkingRef.current = thinking;
  convStateRef.current = convState;

  /* ── auto-scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, thinking]);

  /* ── camera setup ── */
  useEffect(() => {
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setCameraStream(stream);
      } catch {
        setCameraStream(null);
      }
    };
    void setup();
    return () => {
      setCameraStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (!userCamRef.current || !cameraStream) return;
    userCamRef.current.srcObject = cameraStream;
    void userCamRef.current.play().catch(() => {});
  }, [cameraStream]);

  /* ── speech helpers with unlock + retry ── */

  const speakAvatar = useCallback(async (text: string) => {
    if (!text.trim()) return false;
    if (!avatarRef.current) {
      console.error("[ChemSession] avatarRef is null, cannot speak");
      setSpeechError("Speech unavailable: avatar not ready.");
      return false;
    }

    const trySpeak = async () => {
      await avatarRef.current?.unlockAudio();
      if (!avatarRef.current?.isLive()) {
        throw new Error("Avatar is not live yet.");
      }
      await avatarRef.current.speak(text);
    };

    try {
      await trySpeak();
      setSpeechError(null);
      return true;
    } catch (err) {
      console.warn("[ChemSession] speak failed, retrying once:", err);
      try {
        await new Promise((r) => setTimeout(r, 450));
        await trySpeak();
        setSpeechError(null);
        return true;
      } catch (retryErr) {
        console.error("[ChemSession] speak failed after retry:", retryErr);
        setSpeechError("Couldn't play tutor audio. Text response is shown.");
        return false;
      }
    }
  }, []);

  const interruptAvatar = useCallback(() => {
    if (avatarRef.current?.isLive()) {
      void avatarRef.current.interrupt();
    }
  }, []);

  /* ── speaking state callback ── */

  const onSpeakingChange = useCallback((_isSpeaking: boolean) => {}, []);

  /* ── avatar ready → auto-greeting ── */

  const onAvatarReady = useCallback(() => {
    if (greetingSentRef.current) return;
    greetingSentRef.current = true;
    console.log("[ChemSession] avatar ready, delivering greeting");
    setConvState("INITIAL");
    const greeting = "What would you like to learn today?";
    setChat([{ role: "ai", text: greeting }]);
    setTimeout(() => {
      void speakAvatar(greeting);
      setConvState("WAITING_FOR_INPUT");
    }, 450);
  }, [speakAvatar]);

  /* ── lab transition sequence ── */

  const startLabTransition = useCallback(async () => {
    console.log("[ChemSession] → LAB_REQUESTED → DEMO_LOADING → DEMO_ACTIVE");
    setConvState("LAB_REQUESTED");

    const intro =
      "Great! Let me show you an interactive titration demo. I will walk you through it step by step.";
    setChat((p) => [...p, { role: "ai", text: intro }]);
    await speakAvatar(intro);
    setConvState("DEMO_LOADING");
    setLabEnabled(true);

    setTimeout(() => {
      setConvState("DEMO_ACTIVE");
      const msg =
        "Demo is ready. Start with one drop at a time and watch the color change near the endpoint.";
      setChat((p) => [...p, { role: "ai", text: msg }]);
      void speakAvatar(msg);
    }, 450);
  }, [speakAvatar]);

  /* ── send message (intent detection + state machine) ── */

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || thinkingRef.current) return;

      interruptAvatar();
      setChat((prev) => [...prev, { role: "user", text: trimmed }]);

      const state = convStateRef.current;

      if (
        state === "INITIAL" ||
        state === "WAITING_FOR_INPUT" ||
        state === "LISTENING"
      ) {
        if (detectTitrationIntent(trimmed)) {
          void startLabTransition();
          return;
        }
        if (detectGeneralLabIntent(trimmed)) {
          const clarify =
            "Absolutely — I can help with your lab. What type of lab is it: acid-base titration, redox titration, organic synthesis, or something else?";
          setChat((p) => [...p, { role: "ai", text: clarify }]);
          await speakAvatar(clarify);
          setConvState("WAITING_FOR_INPUT");
          return;
        }

        setConvState("LISTENING");
        setThinking(true);

        const { reply } = await askChemTutor(trimmed, null, chat);
        setThinking(false);
        const asksForProtocol = /lab protocol|protocol|paste/i.test(reply);

        if (asksForProtocol) {
          if (labFallbackPromptCountRef.current >= 1) {
            const pivotReply =
              "Let's skip the protocol and jump into a default acid-base titration demo so you can learn by doing.";
            setChat((p) => [...p, { role: "ai", text: pivotReply }]);
            await speakAvatar(pivotReply);
            void startLabTransition();
            return;
          }
          labFallbackPromptCountRef.current += 1;
        }

        setChat((p) => [...p, { role: "ai", text: reply }]);
        await speakAvatar(reply);
        setConvState("WAITING_FOR_INPUT");
        return;
      }

      if (state === "LAB_REQUESTED" || state === "DEMO_LOADING") {
        return;
      }

      if (state === "DEMO_ACTIVE") {
        setThinking(true);
        const labState = titrationRef.current?.getState() ?? null;
        const { reply, action, hint: newHint } = await askChemTutor(
          trimmed,
          labState,
          chat,
        );
        setThinking(false);
        setChat((p) => [...p, { role: "ai", text: reply }]);
        setHint(newHint);

        if (action === "add_drop" && titrationRef.current) {
          titrationRef.current.addDrop();
        } else if (action === "reset" && titrationRef.current) {
          titrationRef.current.reset();
        }

        await speakAvatar(reply);
      }
    },
    [chat, speakAvatar, interruptAvatar, startLabTransition],
  );

  /* ── mic toggle ── */

  const toggleMic = useCallback(() => {
    if (listening) {
      stopContinuousListening();
      setListening(false);
      if (interim.trim()) void sendMessage(interim.trim());
      setInterim("");
      return;
    }

    interruptAvatar();
    void avatarRef.current?.unlockAudio();
    setListening(true);
    setInterim("");
    startContinuousListening({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        setInterim("");
        void sendMessage(t);
      },
      onIdle: () => setListening(false),
    });
  }, [listening, interim, sendMessage, interruptAvatar]);

  /* ── chat input submit ── */

  const handleChatSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!textInput.trim()) return;
      void sendMessage(textInput.trim());
      setTextInput("");
    },
    [textInput, sendMessage],
  );

  /* ── lab controls ── */

  const handleAddDrop = useCallback(() => {
    if (!labEnabled) return;
    for (let i = 0; i < pourRate; i++) {
      titrationRef.current?.addDrop();
    }
  }, [labEnabled, pourRate]);

  const handleReset = useCallback(() => {
    titrationRef.current?.reset();
  }, []);

  /* ── end session ── */

  const endSession = useCallback(() => {
    cancelSpeech();
    stopContinuousListening();
    onEnd();
  }, [onEnd]);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  const showChat = convState !== "CONNECTING";
  const showLab = convState === "LAB_REQUESTED" || convState === "DEMO_LOADING" || convState === "DEMO_ACTIVE";

  return (
    <div className="relative w-full h-screen bg-[#05070f] overflow-hidden font-sans flex">
      {/* Connecting overlay */}
      {convState === "CONNECTING" && <ConnectingScreen />}

      {/* Main area */}
      <div className="flex-1 relative min-w-0">
        {/* 3D Lab (rendered when showLab, behind avatar in z-order) */}
        {showLab && (
          <div className="absolute inset-0 z-0">
            <Canvas
              shadows
              camera={{
                fov: 60,
                near: 0.1,
                far: 50,
                position: [0, 1.6, 2.2],
              }}
              className="w-full h-full"
            >
              <LabEnvironment />
              <TitrationSetup ref={titrationRef} />
              <OrbitControls
                target={[0, 1.0, 0]}
                minDistance={0.8}
                maxDistance={4}
                maxPolarAngle={Math.PI * 0.75}
                minPolarAngle={Math.PI * 0.15}
                enablePan={false}
              />
            </Canvas>
          </div>
        )}

        {/*
          AVATAR — always a single instance.
          When lab is hidden → full screen.
          When lab is showing → PIP in top-left.
          This keeps the LiveKit connection alive across transitions.
        */}
        <div
          className={
            showLab
              ? "absolute top-4 left-4 w-[260px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/15 z-20 transition-all duration-500"
              : "absolute inset-0 z-10 transition-all duration-500"
          }
        >
          <HeyGenAvatar
            ref={avatarRef}
            onAvatarReady={onAvatarReady}
            onSpeakingChange={onSpeakingChange}
          />
        </div>

        {/* User camera tile */}
        {cameraStream ? (
          <div className="absolute top-4 right-4 w-[200px] sm:w-[230px] aspect-video rounded-xl overflow-hidden border border-white/20 bg-black/70 shadow-xl z-30 backdrop-blur">
            <video
              ref={userCamRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute left-2 bottom-2 text-[11px] px-2 py-1 rounded bg-black/55 text-white/90">
              You
            </div>
          </div>
        ) : (
          <div className="absolute top-4 right-4 w-[200px] sm:w-[230px] aspect-video rounded-xl border border-white/15 bg-black/55 shadow-xl z-30 flex items-center justify-center text-white/80">
            <div className="text-center">
              <VideoOff className="w-5 h-5 mx-auto mb-1" />
              <p className="text-[11px]">Camera off</p>
            </div>
          </div>
        )}

        {/* Interim speech bubble */}
        {listening && interim && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white shadow-xl border border-gray-100/50 text-gray-800 font-medium z-30 max-w-xl text-center">
            {interim}...
          </div>
        )}

        {/* Hint banner */}
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 text-amber-200 text-sm font-medium z-30"
            >
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {speechError && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium z-30"
            >
              {speechError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom toolbar */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <div className="bg-black/70 backdrop-blur-xl rounded-full shadow-[0_15px_50px_rgba(2,8,23,0.55)] border border-white/15 flex items-center p-2 gap-2">
            {/* Lab controls (only when demo active) */}
            {convState === "DEMO_ACTIVE" && labEnabled && (
              <div className="flex items-center gap-1 pl-2 border-r border-white/10 pr-3">
                <button
                  onClick={handleAddDrop}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  <Droplets className="w-4 h-4" />
                  {pourRate === 1
                    ? "Drop"
                    : pourRate <= 5
                      ? `${pourRate} Drops`
                      : "Pour"}
                </button>
                <div className="flex items-center gap-1 ml-1">
                  <Gauge className="w-3.5 h-3.5 text-white/50" />
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={pourRate}
                    onChange={(e) => setPourRate(Number(e.target.value))}
                    className="w-16 h-1 accent-emerald-400"
                  />
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-full text-white/60 hover:text-white transition-colors hover:bg-white/10"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mic */}
            <div className="flex items-center gap-3 px-3">
              <button
                onClick={toggleMic}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
                  listening
                    ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.45)]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {listening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <span className="text-sm font-semibold text-white/90 min-w-[100px]">
                {listening ? (
                  <span className="text-red-300">Listening...</span>
                ) : (
                  "Tap to talk"
                )}
              </span>
            </div>

            {/* Leave */}
            <div className="border-l border-white/10 pl-3">
              <button
                onClick={endSession}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
              >
                <PhoneOff className="w-4 h-4" />
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chat panel (right side) ── */}
      {showChat && (
        <div
          className={`shrink-0 flex flex-col bg-[#0a0e1a] border-l border-white/10 transition-all duration-300 ${
            chatCollapsed ? "w-10" : "w-[340px]"
          }`}
        >
          {chatCollapsed ? (
            <button
              onClick={() => setChatCollapsed(false)}
              className="mt-3 mx-auto text-white/60 hover:text-white"
            >
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </button>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">
                    Session Chat
                  </span>
                </div>
                <button
                  onClick={() => setChatCollapsed(true)}
                  className="text-white/40 hover:text-white"
                >
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
                {chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-600/80 text-white rounded-br-sm"
                          : msg.role === "system"
                            ? "bg-white/5 text-gray-500 italic text-xs"
                            : "bg-white/10 text-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl bg-white/10">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {listening && interim && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] px-3 py-2 rounded-xl bg-emerald-600/30 text-emerald-200/70 text-xs italic border border-emerald-500/20 rounded-br-sm">
                      {interim}...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleChatSubmit}
                className="p-3 border-t border-white/10 flex gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask your tutor..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/40"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
