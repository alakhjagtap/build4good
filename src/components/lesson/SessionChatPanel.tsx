"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  MessageSquare,
  Mic,
  MicOff,
  SendHorizonal,
} from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";
import {
  startContinuousListening,
  stopContinuousListening,
  speak,
  cancelSpeech,
  isSpeechSupported,
} from "@/lib/speech";
import {
  buildLiveTutorReply,
  shouldAdvanceLessonStep,
} from "@/lib/tutor-reply";
import type { HeyGenAvatarHandle } from "@/components/instructor/HeyGenAvatar";
import ExplanationPanel from "@/components/lesson/ExplanationPanel";

type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

type Tab = "chat" | "lesson";

interface SessionChatPanelProps {
  avatarRef: RefObject<HeyGenAvatarHandle | null>;
  /** When false, only a slim rail is shown */
  defaultOpen?: boolean;
}

function pushMessage(
  set: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  role: ChatRole,
  text: string,
) {
  set((prev) => [
    ...prev,
    { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, text },
  ]);
}

export default function SessionChatPanel({
  avatarRef,
  defaultOpen = true,
}: SessionChatPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [dictating, setDictating] = useState(false);
  const [interim, setInterim] = useState("");
  const [speechHint, setSpeechHint] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLessonId = useLessonStore((s) => s.currentLesson?.id);

  const { voiceEnabled, setVoiceResponse, recordFollowUp } = useLessonStore();

  const replyToUser = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      pushMessage(setMessages, "user", text.trim());
      setInterim("");

      const state = useLessonStore.getState();
      const trimmed = text.trim();
      if (shouldAdvanceLessonStep(trimmed)) {
        state.nextSegment();
      }
      const { text: reply, advanceSegmentAfterReply } = buildLiveTutorReply(
        trimmed,
        state.currentLesson,
        state.getCurrentSegment(),
      );
      if (advanceSegmentAfterReply) {
        state.nextSegment();
      }
      setVoiceResponse(reply);
      recordFollowUp();
      pushMessage(setMessages, "assistant", reply);

      const avatar = avatarRef.current;
      void (async () => {
        await avatar?.unlockAudio?.();
        const live = avatar?.isLive?.() ?? false;
        if (live) {
          cancelSpeech();
          try {
            await avatar?.interrupt?.();
          } catch {
            /* ignore */
          }
          await avatar?.speak?.(reply);
        } else if (voiceEnabled) {
          await speak(reply);
        }
      })();
    },
    [avatarRef, voiceEnabled, setVoiceResponse, recordFollowUp],
  );

  useEffect(() => {
    if (!currentLessonId) return;
    setMessages([]);
  }, [currentLessonId]);

  useEffect(() => {
    if (!dictating) {
      stopContinuousListening();
      setInterim("");
      return;
    }

    let active = true;
    /** Longer pause after `network` etc. so we don’t hammer the speech backend. */
    let delayAfterIdleMs = 120;
    let hintTimer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (!active) return;
      startContinuousListening({
        onFinal: (t) => {
          if (t.trim()) replyToUser(t.trim());
        },
        onInterim: (t) => setInterim(t),
        onIssue: (code) => {
          const hints: Record<string, string> = {
            network:
              "Voice service hit a network issue (common in Chrome). Check your connection; dictation will retry. You can keep typing.",
            "service-not-allowed":
              "Speech service isn’t available in this context. Try another browser or type your question.",
            "not-allowed":
              "Microphone permission is blocked—allow the mic for this site or use typing.",
            "audio-capture":
              "No microphone detected or it’s in use elsewhere. Try typing instead.",
          };
          if (code === "network") {
            delayAfterIdleMs = Math.max(delayAfterIdleMs, 900);
          }
          const msg = hints[code] ?? `Speech issue (${code}). Try typing.`;
          if (hintTimer) clearTimeout(hintTimer);
          setSpeechHint(msg);
          hintTimer = setTimeout(() => setSpeechHint(null), 12_000);
        },
        onIdle: () => {
          if (!active) return;
          const wait = delayAfterIdleMs;
          delayAfterIdleMs = 120;
          setTimeout(run, wait);
        },
      });
    };
    run();
    return () => {
      active = false;
      if (hintTimer) clearTimeout(hintTimer);
      stopContinuousListening();
      setInterim("");
      setSpeechHint(null);
    };
  }, [dictating, replyToUser]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, interim, tab]);

  const sendDraft = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    replyToUser(t);
  }, [draft, replyToUser]);

  const speechOk = isSpeechSupported();

  return (
    <motion.div
      layout
      className="flex h-full min-h-0 shrink-0 z-20"
      initial={false}
      animate={{ width: open ? 360 : 44 }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col items-center justify-center gap-2 w-11 shrink-0 rounded-l-xl border border-r-0 border-white/[0.1] bg-surface-50/95 backdrop-blur-md text-gray-400 hover:text-white hover:bg-surface-50 transition-colors"
        title={open ? "Close panel" : "Open chat & lesson"}
      >
        {open ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <MessageSquare className="w-5 h-5 text-brand-400" />
        )}
      </button>

      <AnimatePresence initial={false} mode="wait">
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-w-0 min-h-0 rounded-r-xl border border-white/[0.1] border-l-0 bg-surface-50/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            <div className="flex border-b border-white/[0.08] shrink-0">
              <button
                type="button"
                onClick={() => setTab("chat")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  tab === "chat"
                    ? "text-white bg-brand-500/15"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setTab("lesson")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  tab === "lesson"
                    ? "text-white bg-brand-500/15"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Lesson
              </button>
            </div>

            {tab === "chat" ? (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar"
                >
                  {messages.length === 0 && !interim && (
                    <p className="text-xs text-gray-500 leading-relaxed px-1">
                      Ask anything about this lesson (type or mic). If you don&apos;t
                      hear speech, click once anywhere on the page or use the speaker
                      toggle on the tutor card—browsers often block audio until you
                      interact. Without HeyGen configured, set &quot;Voice fallback&quot;
                      on to hear the browser voice.
                    </p>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-brand-500/25 text-indigo-100 border border-brand-500/30"
                            : "bg-white/[0.06] text-gray-200 border border-white/[0.08]"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {interim && dictating && (
                    <div className="flex justify-end">
                      <div className="max-w-[92%] rounded-2xl px-3 py-2 text-sm italic text-gray-500 border border-dashed border-white/15 bg-white/[0.03]">
                        {interim}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-white/[0.08] shrink-0 space-y-2">
                  {speechHint && (
                    <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-2 leading-snug">
                      {speechHint}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!speechOk}
                      onClick={() => setDictating((d) => !d)}
                      title={
                        speechOk
                          ? dictating
                            ? "Stop microphone"
                            : "Transcribe speech to chat"
                          : "Speech recognition not supported"
                      }
                      className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all ${
                        dictating
                          ? "bg-red-500/30 text-red-200 border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.25)]"
                          : "bg-white/[0.06] text-gray-400 hover:text-white border border-white/[0.08] disabled:opacity-30"
                      }`}
                    >
                      {dictating ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendDraft();
                        }
                      }}
                      rows={2}
                      placeholder="Message…"
                      className="flex-1 min-w-0 rounded-xl bg-surface border border-white/10 focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 text-white text-sm p-3 resize-none outline-none placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={sendDraft}
                      disabled={!draft.trim()}
                      className="self-end flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-35 text-white transition-colors shrink-0"
                    >
                      <SendHorizonal className="w-5 h-5" />
                    </button>
                  </div>
                  {!speechOk && (
                    <p className="text-[10px] text-gray-600 px-0.5">
                      Use Chrome or Edge for voice transcription.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
                <ExplanationPanel />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
