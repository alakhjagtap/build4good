"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lightbulb, AlertTriangle, FlaskConical } from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";
import type { LessonSegment } from "@/types/lesson";
import katex from "katex";

const SEGMENT_BADGE: Record<
  LessonSegment["type"],
  { label: string; color: string }
> = {
  hook: { label: "Hook", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  intuition: { label: "Intuition", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  breakdown: { label: "Breakdown", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  "visual-demo": { label: "Visual Demo", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  "worked-example": { label: "Worked Example", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  practice: { label: "Practice", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  recap: { label: "Recap", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
};

function renderKatex(formula: string): string {
  try {
    const cleaned = formula.replace(/\\\\/g, "\\");
    return katex.renderToString(cleaned, {
      throwOnError: false,
      displayMode: true,
    });
  } catch {
    return "";
  }
}

function FormulaCard({
  formula,
  label,
}: {
  formula: string;
  label?: string;
}) {
  const html = useMemo(() => renderKatex(formula), [formula]);

  return (
    <div className="rounded-xl bg-surface border border-white/10 p-4 my-4">
      {label && (
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
          {label}
        </p>
      )}
      {html ? (
        <div
          className="text-white overflow-x-auto katex-display-wrapper"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <code className="text-brand-300 font-mono text-sm break-all">
          {formula}
        </code>
      )}
    </div>
  );
}

export default function ExplanationPanel() {
  const { currentLesson, currentSegmentIndex, getCurrentSegment } =
    useLessonStore();

  const segment = getCurrentSegment();
  const badge = segment ? SEGMENT_BADGE[segment.type] : null;

  return (
    <div className="flex flex-col h-full gap-5 overflow-y-auto pr-1 custom-scrollbar">
      <AnimatePresence mode="wait">
        {segment ? (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* Badge + step indicator */}
            <div className="flex items-center gap-3">
              {badge && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${badge.color}`}
                >
                  {badge.label}
                </span>
              )}
              <span className="text-xs text-gray-600">
                Step {currentSegmentIndex + 1} of{" "}
                {currentLesson?.segments.length ?? 0}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white leading-tight">
              {segment.title}
            </h2>

            {/* Intuition callout */}
            {segment.type === "intuition" && (
              <div className="flex gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200 leading-relaxed">
                  <span className="font-semibold">Intuition: </span>
                  {currentLesson?.intuition}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="text-gray-300 leading-relaxed text-[15px] whitespace-pre-line">
              {segment.content}
            </div>

            {/* Segment formula */}
            {segment.formula && <FormulaCard formula={segment.formula} />}

            {/* Key formulas section */}
            {currentLesson && currentLesson.keyFormulas.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Key Formulas
                  </h3>
                </div>
                <div className="grid gap-2">
                  {currentLesson.keyFormulas.map((kf, i) => (
                    <FormulaCard key={i} formula={kf.formula} label={kf.label} />
                  ))}
                </div>
              </div>
            )}

            {/* Common mistakes on recap */}
            {segment.type === "recap" &&
              currentLesson &&
              currentLesson.commonMistakes.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                      Common Mistakes
                    </h3>
                  </div>
                  <div className="grid gap-2">
                    {currentLesson.commonMistakes.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3"
                      >
                        <span className="text-yellow-400 font-bold text-sm mt-0.5">
                          {i + 1}.
                        </span>
                        <p className="text-sm text-yellow-200/90 leading-relaxed">
                          {m}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-gray-600"
          >
            <BookOpen className="w-12 h-12" />
            <p className="text-sm">
              Search for a topic above to start learning
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
