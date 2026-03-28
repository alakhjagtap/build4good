"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  LayoutDashboard,
  Users,
  Target,
  BarChart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FlaskConical,
  Camera,
  Video
} from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";
import {
  startContinuousListening,
  stopContinuousListening,
} from "@/lib/speech";
import type { HeyGenAvatarHandle } from "@/components/instructor/HeyGenAvatar";
import type { DesmosHandle } from "@/components/visualization/DesmosPanel";

const HeyGenAvatar = dynamic(
  () => import("@/components/instructor/HeyGenAvatar"),
  { ssr: false },
);
const DesmosPanel = dynamic(
  () => import("@/components/visualization/DesmosPanel"),
  { ssr: false },
);
const ChemistrySession = dynamic(
  () => import("@/components/chemistry/ChemistrySession"),
  { ssr: false },
);
import { Landing } from "@/components/landing/Landing";

/* ── auto-playback hook ── */
function useAutoPlayback() {
  const { isPlaying, currentLesson, currentSegmentIndex, setSegmentProgress, nextSegment } =
    useLessonStore();
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      const s = useLessonStore.getState();
      const seg = s.currentLesson?.segments[s.currentSegmentIndex];
      if (!seg) return;
      const next = s.segmentProgress + dt / seg.duration;
      if (next >= 1) {
        setSegmentProgress(1);
        const segs = s.currentLesson?.segments ?? [];
        if (s.currentSegmentIndex < segs.length - 1) nextSegment();
        else useLessonStore.getState().pause();
      } else {
        setSegmentProgress(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [setSegmentProgress, nextSegment],
  );

  useEffect(() => {
    if (isPlaying && currentLesson) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, currentLesson, currentSegmentIndex, tick]);
}

/* ── call OpenAI tutor API ── */
async function askTutor(
  message: string,
  lesson: { title: string; concept: string } | null,
  segment: { title: string; type: string; content: string } | null,
): Promise<{ reply: string; desmosState?: any }> {
  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        lessonTitle: lesson?.title,
        lessonConcept: lesson?.concept,
        segment: segment
          ? { title: segment.title, type: segment.type, content: segment.content }
          : null,
      }),
    });
    const data = (await res.json()) as { reply?: string; desmosState?: any; error?: string };
    if (!res.ok || !data.reply) {
      return { reply: data.error ?? "Sorry, I couldn't process that. Could you try again?" };
    }
    return { reply: data.reply, desmosState: data.desmosState };
  } catch {
    return { reply: "I'm having trouble connecting. Try asking again in a moment." };
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DASHBOARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Dashboard({ onChemistry }: { onChemistry: () => void }) {
  const { loadLesson } = useLessonStore();
  const [activeSection, setActiveSection] = useState<"dashboard" | "courses">(
    "dashboard",
  );

  const startDemo = () => {
    loadLesson("gradient vectors");
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col pt-6 shrink-0">
        <div className="px-6 flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">E</div>
          <span className="font-bold text-xl tracking-tight">Emersa</span>
        </div>
        
        <nav className="flex flex-col px-4 gap-1">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeSection === "dashboard"
                ? "bg-indigo-50/60 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveSection("courses")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeSection === "courses"
                ? "bg-indigo-50/60 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Users className="w-5 h-5" />
            My Courses
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <Target className="w-5 h-5" />
            Goals
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <BarChart className="w-5 h-5" />
            Progress
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <Calendar className="w-5 h-5" />
            Sessions
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {activeSection === "dashboard" ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                  <button
                    onClick={startDemo}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Resume Next Session
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  Welcome back. Here&apos;s a snapshot of your progress.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Courses</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">2</div>
                  <div className="text-xs text-gray-400">Active enrollments</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Sessions</span>
                  </div>
                  <div className="text-4xl font-bold text-indigo-600 mb-1">5</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-500 mb-4">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">Comprehension</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">84%</div>
                  <div className="text-xs text-gray-400">
                    Average across sessions
                  </div>
                </div>
              </div>

              {/* Latest Session */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-lg font-bold tracking-tight mb-6">
                  Latest Session
                </h2>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Feb 14, 7:15 AM · Calculus III</span>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    completed
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                  Worked on gradient vectors and directional derivatives. You
                  initially found the concept of computing the directional
                  derivative from the gradient vector confusing (&apos;why do we
                  dot product with a unit vector?&apos;). After using the 3D visual
                  model - examining how the surface tilts in the direction of
                  the vector - you had a clear &apos;aha&apos; moment. You then
                  successfully computed 3 gradient vectors independently. Strong
                  session.
                </p>

                <div className="space-y-6 mb-8">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-gray-700">Engagement</span>
                      <span className="text-indigo-600">89%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: "89%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-gray-700">Comprehension</span>
                      <span className="text-emerald-600">85%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "85%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Strengths
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li>
                        Had a genuine &apos;aha&apos; moment understanding exactly why
                        vectors must be normalized.
                      </li>
                      <li>
                        Successfully computed partial derivatives and assembled
                        the gradient matrices independently.
                      </li>
                      <li>
                        Smoothly mapped the physical intuition of &quot;steepest
                        ascent&quot; to the math.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      To Improve
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li>
                        Computing mixed partial derivatives takes too much time -
                        practice needed.
                      </li>
                      <li>
                        Should next focus heavily on Tangent Planes and linear
                        approximations.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  My Courses
                </h1>
                <p className="text-gray-500 text-sm">
                  Pick a course to continue where you left off.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={startDemo} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                    C3
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Calculus III</h3>
                    <p className="text-xs text-gray-500">
                      Multivariable Functions
                    </p>
                  </div>
                </div>
                <div onClick={onChemistry} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm cursor-pointer hover:border-emerald-400 transition-all group relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Chemistry</h3>
                    <p className="text-xs text-gray-500">Titration Lab · Immersive 3D</p>
                  </div>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">NEW</span>
                </div>
                <div onClick={onChemistry} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm cursor-pointer hover:border-emerald-400 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 font-bold flex items-center justify-center">
                    CH
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Introductory to Chemistry
                    </h3>
                    <p className="text-xs text-gray-500">
                      Foundations and Core Concepts
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SESSION (Graph + Avatar + Floating Controls)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Session({ onEnd }: { onEnd: () => void }) {
  const {
    currentLesson,
    isPlaying,
    voiceEnabled,
    getCurrentSegment,
    togglePlay,
    nextSegment,
    prevSegment,
    recordFollowUp,
  } = useLessonStore();

  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const avatarRef = useRef<HeyGenAvatarHandle>(null);
  const desmosRef = useRef<DesmosHandle>(null);
  const lastSpokenId = useRef<string | null>(null);
  const thinkingRef = useRef(false);
  thinkingRef.current = thinking;
  const segment = getCurrentSegment();
  const greetingPlayed = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visionCanvasRef = useRef<HTMLCanvasElement>(null);
  const visionLoopRef = useRef<NodeJS.Timeout | null>(null);
  const [visionMath, setVisionMath] = useState<string[]>([]);
  const isSpeakingRef = useRef(false);

  useAutoPlayback();

  // Handle personalized greeting when avatar is loaded
  const handleAvatarReady = useCallback(() => {
    if (greetingPlayed.current) return;
    greetingPlayed.current = true;
    
    // Retrieve user's name from auth/sign-in state
    // We fall back to standard localStorage if implemented, else empty.
    let firstName = "";
    try {
      firstName = localStorage.getItem("first_name") || "";
    } catch {
      // ignore
    }

    const greeting = firstName.trim()
      ? `Hey ${firstName.trim()}, what would you like to learn today?`
      : "Hey, what would you like to learn today?";

    avatarRef.current?.speak(greeting);
  }, []);

  // Apply Desmos state when segment changes
  useEffect(() => {
    if (!segment?.desmosState || !desmosRef.current) return;
    desmosRef.current.applyState(segment.desmosState);
  }, [segment]);

  // Speak caption when segment changes
  useEffect(() => {
    if (!segment || segment.id === lastSpokenId.current) return;
    lastSpokenId.current = segment.id;
    
    // We strictly use HeyGen to route all spoken dialogue.
    // If the HeyGen avatar isn't connected yet, the TTS engine won't play fallback.
    const text = segment.captionText ?? segment.content.slice(0, 250);
    if (avatarRef.current?.isLive()) {
      avatarRef.current.speak(text);
    }
  }, [segment]);

  // Send a question to the real AI tutor
  const sendQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || thinkingRef.current) return;

      setThinking(true);
      recordFollowUp();

      try {
        const seg = useLessonStore.getState().getCurrentSegment();
        const lesson = useLessonStore.getState().currentLesson;
        const { reply, desmosState } = await askTutor(
          trimmed,
          lesson ? { title: lesson.title, concept: lesson.concept } : null,
          seg ? { title: seg.title, type: seg.type, content: seg.content } : null,
        );

        if (desmosState && desmosRef.current) {
          desmosRef.current.applyState(desmosState);
        }

        if (avatarRef.current?.isLive()) {
          avatarRef.current.speak(reply);
        }
      } catch (err) {
        console.error("Tutor error:", err);
      } finally {
        setThinking(false);
      }
    },
    [recordFollowUp],
  );



  // Microphone always-on auto-start
  useEffect(() => {
    // We start listening as soon as the session begins
    setListening(true);
    startContinuousListening({
      onInterim: (text) => setInterim(text),
      onFinal: (text) => {
        setInterim("");
        // Don't respond to ourselves or process multiple at once
        if (thinkingRef.current || avatarRef.current?.isSpeaking()) return;
        void sendQuestion(text);
      },
      onIdle: () => {
        // Automatically restart if idle (unless the component unmounts)
        setListening(true);
        startContinuousListening({
          onInterim: (text) => setInterim(text),
          onFinal: (text) => {
            setInterim("");
            void sendQuestion(text);
          },
          onIdle: () => {},
        });
      },
      onIssue: (code) => {
        console.warn("Speech issue:", code);
      },
    });

    return () => {
      stopContinuousListening();
    };
  }, [sendQuestion]);

  // Webcam vision loop
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initCam() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) videoRef.current.srcObject = localStream;
      } catch (err) {
        console.warn("Camera init failed:", err);
      }
    }
    void initCam();

    visionLoopRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = visionCanvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = 480;
      canvas.height = 270;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);

      void (async () => {
        try {
          const res = await fetch("/api/vision", {
            method: "POST",
            body: JSON.stringify({ image: dataUrl }),
            headers: { "Content-Type": "application/json" },
          });
          const data = (await res.json()) as { equations: { latex: string; confidence: number }[] };
          if (data.equations?.length > 0) {
            const bestEqs = data.equations.filter((e) => e.confidence > 0.8).map((e) => e.latex);
            if (bestEqs.length > 0) {
              setVisionMath((prev) => Array.from(new Set([...prev, ...bestEqs])));
              if (desmosRef.current) {
                desmosRef.current.applyState({
                  commands: bestEqs.map((l, i) => ({ id: `vision-${i}`, latex: l, color: "#6366f1" })),
                });
              }
            }
          }
        } catch (e) { /* ignore */ }
      })();
    }, 3500);

    return () => {
      if (visionLoopRef.current) clearInterval(visionLoopRef.current);
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const endCall = useCallback(() => {
    stopContinuousListening();
    onEnd();
  }, [onEnd]);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans">
      
      {/* Fullscreen Graph */}
      <div className="absolute inset-0 z-0">
        <DesmosPanel ref={desmosRef} />
      </div>

      {/* Top Right Floating Avatar */}
      <div className="absolute top-6 right-6 w-[340px] aspect-video bg-black rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 z-10">
        <HeyGenAvatar ref={avatarRef} onAvatarReady={handleAvatarReady} />
      </div>

      {/* Interim Listening Text Popup */}
      {listening && interim && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white shadow-xl border border-gray-100/50 text-gray-800 font-medium z-10 max-w-xl text-center">
          {interim}...
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center p-2 z-10 gap-2">
        
        {/* Talk Controls */}
        <div className="flex items-center gap-3 px-3">
          <div
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
              listening
                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>

          <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
            {thinking ? "Tutor is thinking..." : listening ? "Listening..." : "Microphone Active"}
          </span>
        </div>

        {/* Vision Sidebar Indicator */}
        <div className="flex items-center gap-2 border-l border-gray-100 pl-3 pr-2">
          <Video className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vision Engine Active</span>
        </div>

        {/* Leave Button */}
        <div className="border-l border-gray-100 pl-3">
          <button
            onClick={endCall}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
          >
            <PhoneOff className="w-4 h-4" />
            Leave
          </button>
        </div>

      </div>

      {/* Camera Capture Feed (User's Vision) */}
      <div className="absolute bottom-6 right-6 w-48 aspect-video bg-black rounded-lg overflow-hidden border border-gray-200 shadow-lg z-10 group hover:w-80 transition-all duration-300">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <canvas ref={visionCanvasRef} className="hidden" />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-bold">LIVE CAMERA</div>
      </div>

      {/* Vision Result Overlay */}
      {visionMath.length > 0 && (
        <div className="absolute top-32 right-6 w-48 max-h-[300px] overflow-y-auto bg-white/90 backdrop-blur rounded-xl border border-gray-100 p-3 shadow-sm z-10 space-y-2">
           <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">Recognized Equations</h4>
           {visionMath.map((m, i) => (
             <div key={i} className="px-2 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-mono rounded border border-indigo-100">
               {m}
             </div>
           ))}
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ROOT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function HomePage() {
  const { currentLesson } = useLessonStore();
  const [inCall, setInCall] = useState(false);
  const [chemMode, setChemMode] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    if (currentLesson && !inCall && !chemMode) setInCall(true);
  }, [currentLesson, inCall, chemMode]);

  const handleEnd = useCallback(() => {
    setInCall(false);
    setTimeout(() => useLessonStore.getState().loadLesson("__reset__"), 300);
  }, []);

  const handleChemEnd = useCallback(() => {
    setChemMode(false);
  }, []);

  if (!inApp) {
    return <Landing onEnterApp={() => setInApp(true)} />;
  }

  return (
    <AnimatePresence mode="wait">
      {chemMode ? (
        <motion.div
          key="chemistry"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <ChemistrySession onEnd={handleChemEnd} />
        </motion.div>
      ) : inCall && currentLesson ? (
        <motion.div
          key="session"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen"
        >
          <Session onEnd={handleEnd} />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Dashboard onChemistry={() => setChemMode(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
