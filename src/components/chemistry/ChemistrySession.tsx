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
  Waves,
  SkipForward,
} from "lucide-react";
import {
  startContinuousListening,
  stopContinuousListening,
  cancelSpeech,
} from "@/lib/speech";
import {
  playDrip,
  startPourSound,
  stopPourSound,
  startAmbient,
  stopAmbient,
  disposeSounds,
} from "@/lib/lab-sounds";
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
  | "EXPLAINING"
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
  labState: {
    drops: number;
    volume: number;
    ph: number;
    color: string;
  } | null,
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
    const data = (await res.json()) as TutorResponse & {
      error?: string;
    };
    if (!res.ok || !data.reply) {
      return {
        reply:
          data.error ?? "Sorry, could you try saying that again?",
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

/* ─── guided explanation steps ─── */

const EXPLANATION_STEPS: {
  highlight: "burette" | "flask" | "indicator" | null;
  text: string;
}[] = [
  {
    highlight: "burette",
    text: "This is the burette — filled with sodium hydroxide, our base. It lets us control exactly how much solution we add, drop by drop or as a steady stream.",
  },
  {
    highlight: "flask",
    text: "Below is the Erlenmeyer flask containing 25 milliliters of hydrochloric acid. This is the solution we are titrating.",
  },
  {
    highlight: "indicator",
    text: "We have added phenolphthalein indicator. It stays colorless in acid but turns pink the moment the solution becomes basic — that is how we know we have reached the endpoint.",
  },
  {
    highlight: null,
    text: "Your goal is to add base slowly until the solution just turns pink and stays pink. That is the equivalence point. Go ahead, start adding drops — or hold the pour button for a steady stream!",
  },
];

function estimateSpeechMs(text: string): number {
  return Math.max(3500, (text.split(" ").length / 2.5) * 1000 + 1500);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function ChemistrySession({
  onEnd,
}: {
  onEnd: () => void;
}) {
  /* ── state ── */
  const [convState, setConvState] = useState<ConvState>("CONNECTING");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [textInput, setTextInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(
    null,
  );
  const [labEnabled, setLabEnabled] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isPouringUI, setIsPouringUI] = useState(false);

  /* ── refs ── */
  const avatarRef = useRef<HeyGenAvatarHandle>(null);
  const titrationRef = useRef<TitrationHandle>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userCamRef = useRef<HTMLVideoElement>(null);
  const thinkingRef = useRef(false);
  const convStateRef = useRef<ConvState>("CONNECTING");
  const labFallbackPromptCountRef = useRef(0);
  const greetingSentRef = useRef(false);
  const explanationIdxRef = useRef(0);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pourHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  /* ── cleanup sounds on unmount ── */
  useEffect(() => disposeSounds, []);

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
        console.error(
          "[ChemSession] speak failed after retry:",
          retryErr,
        );
        setSpeechError(
          "Couldn't play tutor audio. Text response is shown.",
        );
        return false;
      }
    }
  }, []);

  const interruptAvatar = useCallback(() => {
    if (avatarRef.current?.isLive()) {
      void avatarRef.current.interrupt();
    }
  }, []);

  /* ── explanation sequence driver ── */

  const advanceExplanation = useCallback(() => {
    const idx = explanationIdxRef.current;

    if (idx >= EXPLANATION_STEPS.length) {
      titrationRef.current?.setHighlight(null);
      setConvState("DEMO_ACTIVE");
      setLabEnabled(true);
      startAmbient();
      return;
    }

    const step = EXPLANATION_STEPS[idx];
    explanationIdxRef.current = idx + 1;

    titrationRef.current?.setHighlight(step.highlight);
    setChat((p) => [...p, { role: "ai", text: step.text }]);
    void speakAvatar(step.text);

    if (speechTimeoutRef.current)
      clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(
      () => advanceExplanation(),
      estimateSpeechMs(step.text),
    );
  }, [speakAvatar]);

  const advanceExplanationRef = useRef(advanceExplanation);
  advanceExplanationRef.current = advanceExplanation;

  /* ── skip intro: jump straight to demo ── */

  const skipIntro = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    interruptAvatar();
    titrationRef.current?.setHighlight(null);
    setConvState("DEMO_ACTIVE");
    setLabEnabled(true);
    startAmbient();
    setChat((p) => [
      ...p,
      {
        role: "system" as const,
        text: "Intro skipped — lab controls are now active.",
      },
    ]);
  }, [interruptAvatar]);

  /* ── speaking state callback (drives explanation) ── */

  const onSpeakingChange = useCallback((isSpeaking: boolean) => {
    if (isSpeaking) return;

    const state = convStateRef.current;

    if (state === "LAB_REQUESTED") {
      if (speechTimeoutRef.current)
        clearTimeout(speechTimeoutRef.current);
      setTimeout(() => {
        setConvState("EXPLAINING");
        advanceExplanationRef.current();
      }, 400);
    }

    if (state === "EXPLAINING") {
      if (speechTimeoutRef.current)
        clearTimeout(speechTimeoutRef.current);
      setTimeout(() => advanceExplanationRef.current(), 500);
    }
  }, []);

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
    console.log("[ChemSession] → LAB_REQUESTED → EXPLAINING");
    setConvState("LAB_REQUESTED");
    explanationIdxRef.current = 0;

    const intro =
      "Great! Let me show you an interactive titration demo. I will walk you through it step by step.";
    setChat((p) => [...p, { role: "ai", text: intro }]);
    await speakAvatar(intro);

    speechTimeoutRef.current = setTimeout(
      () => {
        setConvState("EXPLAINING");
        advanceExplanationRef.current();
      },
      estimateSpeechMs(intro),
    );
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
        const asksForProtocol = /lab protocol|protocol|paste/i.test(
          reply,
        );

        if (asksForProtocol) {
          if (labFallbackPromptCountRef.current >= 1) {
            const pivotReply =
              "Let's skip the protocol and jump into a default acid-base titration demo so you can learn by doing.";
            setChat((p) => [
              ...p,
              { role: "ai", text: pivotReply },
            ]);
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

      if (state === "LAB_REQUESTED" || state === "EXPLAINING") {
        return;
      }

      if (state === "DEMO_ACTIVE") {
        setThinking(true);
        const labState = titrationRef.current?.getState() ?? null;
        const {
          reply,
          action,
          hint: newHint,
        } = await askChemTutor(trimmed, labState, chat);
        setThinking(false);
        setChat((p) => [...p, { role: "ai", text: reply }]);
        setHint(newHint);

        if (action === "add_drop" && titrationRef.current) {
          titrationRef.current.addDrop();
          playDrip();
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

  const handleDrop = useCallback(() => {
    if (!labEnabled) return;
    titrationRef.current?.addDrop();
    playDrip();
  }, [labEnabled]);

  const handlePourStart = useCallback(() => {
    if (!labEnabled) return;
    pourHoldTimerRef.current = setTimeout(() => {
      titrationRef.current?.startPour();
      startPourSound();
      setIsPouringUI(true);
    }, 150);
  }, [labEnabled]);

  const handlePourStop = useCallback(() => {
    if (pourHoldTimerRef.current) {
      clearTimeout(pourHoldTimerRef.current);
      pourHoldTimerRef.current = null;
    }
    if (isPouringUI) {
      titrationRef.current?.stopPour();
      stopPourSound();
      setIsPouringUI(false);
    }
  }, [isPouringUI]);

  const handleReset = useCallback(() => {
    titrationRef.current?.reset();
    stopPourSound();
    setIsPouringUI(false);
  }, []);

  /* ── end session ── */

  const endSession = useCallback(() => {
    cancelSpeech();
    stopContinuousListening();
    disposeSounds();
    onEnd();
  }, [onEnd]);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  const showChat = convState !== "CONNECTING";
  const showLab =
    convState === "LAB_REQUESTED" ||
    convState === "EXPLAINING" ||
    convState === "DEMO_ACTIVE";

  return (
    <div className="relative w-full h-screen bg-[#0a0c14] overflow-hidden font-sans flex">
      {/* Connecting overlay */}
      {convState === "CONNECTING" && <ConnectingScreen />}

      {/* Main area */}
      <div className="flex-1 relative min-w-0">
        {/* 3D Lab */}
        {showLab && (
          <div className="absolute inset-0 z-0">
            <Canvas
              shadows
              camera={{
                fov: 55,
                near: 0.1,
                far: 50,
                position: [0.15, 1.35, 1.8],
              }}
              className="w-full h-full"
              gl={{ antialias: true, toneMapping: 3 }}
            >
              <LabEnvironment />
              <TitrationSetup ref={titrationRef} />
              <OrbitControls
                target={[0, 1.0, 0]}
                minDistance={0.6}
                maxDistance={3.5}
                maxPolarAngle={Math.PI * 0.72}
                minPolarAngle={Math.PI * 0.18}
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
              />
            </Canvas>
          </div>
        )}

        {/* Dim overlay during guided explanation */}
        <AnimatePresence>
          {convState === "EXPLAINING" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-black/25 z-[1] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Skip Intro button — visible only during setup explanation */}
        <AnimatePresence>
          {(convState === "EXPLAINING" ||
            convState === "LAB_REQUESTED") && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              onClick={skipIntro}
              className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-xl border border-white/[0.12] text-white/80 hover:text-white text-sm font-medium shadow-lg transition-all duration-200 cursor-pointer select-none"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip Intro
            </motion.button>
          )}
        </AnimatePresence>

        {/* Avatar — fullscreen when no lab, PIP when lab shows */}
        <div
          className={
            showLab
              ? "absolute top-4 left-4 w-[240px] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20 transition-all duration-700"
              : "absolute inset-0 z-10 transition-all duration-700"
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
          <div className="absolute top-4 right-4 w-[180px] sm:w-[210px] aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-xl z-30 backdrop-blur-sm">
            <video
              ref={userCamRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute left-2 bottom-2 text-[10px] px-2 py-0.5 rounded-md bg-black/50 text-white/80 font-medium">
              You
            </div>
          </div>
        ) : (
          <div className="absolute top-4 right-4 w-[180px] sm:w-[210px] aspect-video rounded-2xl border border-white/10 bg-black/40 shadow-xl z-30 flex items-center justify-center text-white/60">
            <div className="text-center">
              <VideoOff className="w-4 h-4 mx-auto mb-1" />
              <p className="text-[10px]">Camera off</p>
            </div>
          </div>
        )}

        {/* Interim speech bubble */}
        {listening && interim && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white/95 shadow-xl border border-gray-100/50 text-gray-800 font-medium z-30 max-w-xl text-center text-sm">
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
              className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-amber-500/15 backdrop-blur-xl border border-amber-500/25 text-amber-200 text-sm font-medium z-30"
            >
              {hint}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speech error fallback */}
        <AnimatePresence>
          {speechError && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium z-30"
            >
              {speechError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom toolbar ── */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <motion.div
            layout
            className="bg-white/[0.07] backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/[0.12] flex items-center p-2.5 gap-1"
          >
            {/* Lab controls */}
            {convState === "DEMO_ACTIVE" && labEnabled && (
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
                {/* Drop button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDrop}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Drop
                </motion.button>

                {/* Pour button (hold) */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onPointerDown={handlePourStart}
                  onPointerUp={handlePourStop}
                  onPointerLeave={handlePourStop}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isPouringUI
                      ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  {isPouringUI ? "Pouring..." : "Hold to Pour"}
                </motion.button>

                {/* Reset */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleReset}
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  title="Reset experiment"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            )}

            {/* Mic */}
            <div className="flex items-center gap-2.5 px-3">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={toggleMic}
                className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                  listening
                    ? "bg-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)]"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {listening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>
              <span className="text-sm font-medium text-white/80 min-w-[85px]">
                {listening ? (
                  <span className="text-red-300">Listening...</span>
                ) : (
                  "Tap to talk"
                )}
              </span>
            </div>

            {/* Leave */}
            <div className="border-l border-white/10 pl-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={endSession}
                className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-xl text-white text-sm font-bold transition-colors whitespace-nowrap"
              >
                <PhoneOff className="w-4 h-4" />
                Leave
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Chat panel ── */}
      {showChat && (
        <div
          className={`shrink-0 flex flex-col bg-[#0c101c]/95 backdrop-blur-sm border-l border-white/[0.06] transition-all duration-300 ${
            chatCollapsed ? "w-10" : "w-[320px]"
          }`}
        >
          {chatCollapsed ? (
            <button
              onClick={() => setChatCollapsed(false)}
              className="mt-3 mx-auto text-white/50 hover:text-white transition-colors"
            >
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </button>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white/90">
                    Session Chat
                  </span>
                </div>
                <button
                  onClick={() => setChatCollapsed(true)}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-600/70 text-white rounded-br-md"
                          : msg.role === "system"
                            ? "bg-white/[0.04] text-gray-500 italic text-xs"
                            : "bg-white/[0.08] text-gray-200 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-2xl bg-white/[0.08]">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                            style={{
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {listening && interim && (
                  <div className="flex justify-end">
                    <div className="max-w-[88%] px-3 py-2 rounded-2xl bg-emerald-600/20 text-emerald-200/60 text-xs italic border border-emerald-500/15 rounded-br-md">
                      {interim}...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleChatSubmit}
                className="p-3 border-t border-white/[0.06] flex gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask your tutor..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/25 text-sm focus:outline-none focus:border-emerald-500/30 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-emerald-600/70 text-white hover:bg-emerald-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
