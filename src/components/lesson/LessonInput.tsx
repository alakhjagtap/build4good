"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";

const SUGGESTIONS = [
  "gradient vectors",
  "partial derivatives",
  "tangent planes",
  "double integrals",
  "Lagrange multipliers",
];

interface LessonInputProps {
  /** Wider hero layout: chips and field read as the centered focal point */
  variant?: "default" | "landing";
}

export default function LessonInput({ variant = "default" }: LessonInputProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { currentLesson, loadLesson } = useLessonStore();

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    loadLesson(trimmed);
  }, [query, loadLesson]);

  const handleChipClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      loadLesson(suggestion);
    },
    [loadLesson],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit],
  );

  const isLanding = variant === "landing";

  return (
    <div className={`w-full ${isLanding ? "max-w-2xl" : "max-w-3xl"} mx-auto`}>
      <div
        className={`
          relative flex items-center gap-3 rounded-2xl
          bg-surface-50 border px-5 py-4
          transition-all duration-300
          ${
            isFocused
              ? "border-brand-500 shadow-[0_0_24px_rgba(99,102,241,0.25)]"
              : "border-white/10 shadow-lg"
          }
        `}
      >
        <div className="flex-shrink-0 text-brand-400">
          <Brain className="w-6 h-6" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Teach me about gradient vectors..."
          className="
            flex-1 bg-transparent text-white text-lg
            placeholder:text-gray-500 outline-none
          "
        />

        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="
            flex-shrink-0 flex items-center gap-2
            bg-brand-500 hover:bg-brand-600 disabled:opacity-40
            disabled:cursor-not-allowed
            text-white font-medium text-sm
            px-5 py-2.5 rounded-xl
            transition-all duration-200
          "
        >
          <Sparkles className="w-4 h-4" />
          <span>Teach Me</span>
        </button>
      </div>

      <AnimatePresence>
        {!currentLesson && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-wrap items-center gap-2 mt-4 px-2 ${
              isLanding ? "justify-center" : ""
            }`}
          >
            <span className="text-gray-500 text-sm mr-1 shrink-0">Try:</span>
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.25 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChipClick(s)}
                className="
                  px-3.5 py-1.5 rounded-full text-sm
                  bg-surface-100 border border-white/10
                  text-gray-300 hover:text-white
                  hover:border-brand-500/50 hover:bg-brand-500/10
                  transition-colors duration-200
                "
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
