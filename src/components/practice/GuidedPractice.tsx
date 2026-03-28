"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";

interface GuidedPracticeProps {
  /** When set, shows a close control (e.g. floating over the visualization) */
  onClose?: () => void;
}

export default function GuidedPractice({ onClose }: GuidedPracticeProps) {
  const { currentLesson } = useLessonStore();
  const practice = currentLesson?.guidedPractice ?? null;

  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const revealNextHint = useCallback(() => {
    if (!practice) return;
    setRevealedHints((prev) => Math.min(prev + 1, practice.hints.length));
  }, [practice]);

  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
  }, []);

  const handleCheck = useCallback(() => {
    setChecked(true);
  }, []);

  const handleReset = useCallback(() => {
    setRevealedHints(0);
    setShowSolution(false);
    setAnswer("");
    setChecked(false);
  }, []);

  if (!practice) return null;

  return (
    <div className="rounded-2xl bg-surface-50 border border-brand-500/20 shadow-[0_0_30px_rgba(99,102,241,0.08)] overflow-hidden flex flex-col max-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-brand-500/5 shrink-0">
        <Sparkles className="w-5 h-5 text-brand-400" />
        <h3 id="guided-practice-title" className="font-bold text-white flex-1">
          Guided Practice
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close guided practice"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar min-h-0">
        {/* Problem */}
        <div className="rounded-xl bg-surface border border-white/10 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
            Problem
          </p>
          <p className="text-gray-200 leading-relaxed">{practice.problem}</p>
        </div>

        {/* Answer input */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
            rows={3}
            placeholder="Type your answer here..."
            className="
              w-full rounded-xl bg-surface border border-white/10
              focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25
              text-white text-sm p-4 resize-none outline-none
              placeholder:text-gray-600 transition-all
            "
          />
        </div>

        {/* Check button + result */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheck}
            disabled={!answer.trim()}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              bg-brand-500 hover:bg-brand-600 text-white
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <CheckCircle2 className="w-4 h-4" />
            Check
          </button>

          <AnimatePresence>
            {checked && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-400 font-medium"
              >
                Great effort! Keep practicing to master this concept.
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Hints section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Hints
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {practice.hints.map((hint, i) => {
              const isRevealed = i < revealedHints;
              const isNext = i === revealedHints;

              return (
                <div key={i}>
                  {isRevealed ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-lg bg-brand-500/10 border border-brand-500/20 p-3"
                    >
                      <p className="text-sm text-brand-200">
                        <span className="font-semibold text-brand-300">
                          Hint {i + 1}:{" "}
                        </span>
                        {hint}
                      </p>
                    </motion.div>
                  ) : isNext ? (
                    <button
                      onClick={revealNextHint}
                      className="
                        flex items-center gap-2 w-full text-left
                        rounded-lg border border-dashed border-white/10
                        hover:border-brand-500/30 hover:bg-brand-500/5
                        p-3 text-sm text-gray-500 hover:text-gray-300
                        transition-colors
                      "
                    >
                      <ChevronRight className="w-4 h-4" />
                      Reveal Hint {i + 1}
                    </button>
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/5 p-3 text-sm text-gray-700">
                      Hint {i + 1} (locked)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Solution */}
        <div>
          {!showSolution ? (
            <button
              onClick={handleShowSolution}
              className="
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                bg-white/5 hover:bg-white/10 border border-white/10
                text-gray-400 hover:text-white transition-all
              "
            >
              <Eye className="w-4 h-4" />
              Show Solution
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-green-500/10 border border-green-500/20 p-5"
            >
              <p className="text-xs text-green-400 uppercase tracking-wider font-medium mb-3">
                Solution
              </p>

              <div className="flex flex-col gap-3">
                {practice.solutionSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 * i }}
                    className="flex gap-3"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-green-200/90 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-green-500/10">
                <p className="text-sm text-green-300 font-medium">
                  Answer: {practice.solution}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Reset */}
        {(revealedHints > 0 || showSolution || checked) && (
          <button
            onClick={handleReset}
            className="self-end text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Reset practice
          </button>
        )}
      </div>
    </div>
  );
}
