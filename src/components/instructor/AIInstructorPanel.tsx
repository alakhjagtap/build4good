"use client";

import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { AlertTriangle, X, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";
import { speak, cancelSpeech } from "@/lib/speech";
import { buildSessionIntro } from "@/lib/tutor-reply";
import type { HeyGenAvatarHandle } from "./HeyGenAvatar";

const HeyGenAvatar = dynamic(() => import("./HeyGenAvatar"), { ssr: false });

function TypingText({ text, small }: { text: string; small?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed("");
    idx.current = 0;
    if (!text) return;
    const id = setInterval(() => {
      idx.current += 1;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(id);
    }, small ? 18 : 22);
    return () => clearInterval(id);
  }, [text, small]);

  return (
    <span className={small ? "text-xs" : ""}>
      {displayed}
      {displayed.length < (text?.length ?? 0) && (
        <span className="inline-block w-[2px] h-3 bg-brand-400 ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}

interface AIInstructorPanelProps {
  compact?: boolean;
}

const AIInstructorPanel = forwardRef<HeyGenAvatarHandle, AIInstructorPanelProps>(
  function AIInstructorPanel({ compact = false }, ref) {
    const {
      currentLesson,
      voiceEnabled,
      lastVoiceResponse,
      showAdaptivePrompt,
      adaptive,
      getCurrentSegment,
      setVoiceEnabled,
      dismissAdaptive,
    } = useLessonStore();

    const segment = getCurrentSegment();
    const [showBubble, setShowBubble] = useState(false);
    const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const introSpokenLessonIdRef = useRef<string | null>(null);
    const sessionLiveRef = useRef(false);

    const trySpeakIntro = useCallback(() => {
      const { currentLesson: lesson, voiceEnabled } = useLessonStore.getState();
      const api = ref && typeof ref !== "function" ? ref.current : null;
      if (!lesson || !sessionLiveRef.current) return;
      if (introSpokenLessonIdRef.current === lesson.id) return;
      introSpokenLessonIdRef.current = lesson.id;
      const script = buildSessionIntro(lesson);
      void (async () => {
        await api?.unlockAudio?.();
        const live = api?.isLive?.() ?? false;
        if (live) {
          cancelSpeech();
          await api?.speak?.(script);
        } else if (voiceEnabled) {
          await speak(script).catch(() => {});
        }
      })();
    }, [ref]);

    const onSessionReady = useCallback(() => {
      sessionLiveRef.current = true;
      trySpeakIntro();
    }, [trySpeakIntro]);

    useEffect(() => {
      if (!currentLesson) {
        introSpokenLessonIdRef.current = null;
        return;
      }
      trySpeakIntro();
    }, [currentLesson?.id, trySpeakIntro]);

    useEffect(() => {
      if (lastVoiceResponse) {
        setShowBubble(true);
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
        bubbleTimer.current = setTimeout(
          () => setShowBubble(false),
          compact ? 5000 : 6000,
        );
      }
      return () => {
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      };
    }, [lastVoiceResponse, compact]);

    const adaptiveMessage =
      adaptive.suggestedAction === "simpler-explanation"
        ? "This seems tricky. Want a simpler explanation?"
        : adaptive.suggestedAction === "another-example"
          ? "Would you like another example?"
          : null;

    const capPad = compact ? "p-2.5 min-h-[52px]" : "p-4 min-h-[72px]";
    const gapClass = compact ? "gap-2" : "gap-4";

    return (
      <div className={`flex flex-col h-full ${gapClass}`}>
        <HeyGenAvatar ref={ref} />

        <div
          className={`rounded-xl bg-surface-50 border border-white/10 ${capPad}`}
        >
          <p className={`text-gray-300 leading-relaxed ${compact ? "text-xs line-clamp-4" : "text-sm"}`}>
            {segment?.captionText ? (
              <TypingText text={segment.captionText} small={compact} />
            ) : (
              <span className="text-gray-600 italic text-xs">
                Live session — ask questions in chat or use the mic. I&apos;ll respond in
                real time.
              </span>
            )}
          </p>
        </div>

        <AnimatePresence>
          {showBubble && lastVoiceResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`relative rounded-xl bg-brand-500/15 border border-brand-500/30 ${
                compact ? "p-2.5" : "p-4"
              }`}
            >
              <MessageCircle
                className={`absolute -top-2 -left-1 text-brand-400 ${compact ? "w-4 h-4" : "w-5 h-5"}`}
              />
              <p className={`text-gray-200 leading-relaxed ${compact ? "text-xs" : "text-sm"}`}>
                {lastVoiceResponse}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAdaptivePrompt && adaptiveMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-xl bg-yellow-500/10 border border-yellow-500/30 ${
                compact ? "p-2.5" : "p-4"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className={`text-yellow-200 mb-2 ${compact ? "text-xs" : "text-sm"}`}>
                    {adaptiveMessage}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={dismissAdaptive}
                      className="px-3 py-1 text-[11px] font-medium rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                    >
                      Yes, please!
                    </button>
                    <button
                      type="button"
                      onClick={dismissAdaptive}
                      className="px-3 py-1 text-[11px] font-medium rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 transition-colors"
                    >
                      No, I&apos;m good
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismissAdaptive}
                  className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-end gap-2 mt-auto">
          <span className={`text-gray-500 ${compact ? "text-[10px]" : "text-xs"} mr-auto`}>
            Voice fallback
          </span>
          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`rounded-lg transition-colors border ${
              voiceEnabled
                ? "bg-brand-500/20 text-brand-300 border-brand-500/30"
                : "bg-white/5 text-gray-500 border-white/10"
            } ${compact ? "p-1.5" : "text-xs px-3 py-1.5"}`}
            title="Browser speech when the avatar is unavailable"
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  },
);

AIInstructorPanel.displayName = "AIInstructorPanel";
export default AIInstructorPanel;
