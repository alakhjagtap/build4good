"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  active: boolean;
  query?: string | null;
}

const equations = [
  "∇f(x,y)",
  "∂f/∂x",
  "∫∫_R f dA",
  "z = x^2 + y^2",
  "∇f = λ∇g",
];

export default function LessonLoadingOverlay({ active, query }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, clipPath: "circle(8% at 50% 50%)" }}
          animate={{ opacity: 1, clipPath: "circle(140% at 50% 50%)" }}
          exit={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] overflow-hidden bg-[#060814]/95 backdrop-blur-xl"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 30%, rgba(99,102,241,0.34), rgba(6,8,20,0.92) 48%)",
                "radial-gradient(circle at 80% 40%, rgba(56,189,248,0.24), rgba(6,8,20,0.92) 50%)",
                "radial-gradient(circle at 35% 70%, rgba(236,72,153,0.18), rgba(6,8,20,0.92) 50%)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {Array.from({ length: 22 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute block w-1.5 h-1.5 rounded-full bg-indigo-300/55"
              style={{
                left: `${6 + ((i * 93) % 88)}%`,
                top: `${8 + ((i * 37) % 84)}%`,
              }}
              animate={{
                y: [0, -14, 0, 10, 0],
                opacity: [0.15, 0.7, 0.2],
                scale: [0.8, 1.2, 0.9],
              }}
              transition={{
                duration: 2 + (i % 5) * 0.45,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.06,
              }}
            />
          ))}

          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-indigo-200/90"
            >
              Building your lesson
            </motion.div>

            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-5 text-2xl md:text-4xl font-semibold text-white text-balance"
            >
              Teaching:{" "}
              <span className="text-indigo-300">
                {query?.trim() ? query : "multivariable calculus"}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.45 }}
              className="mt-3 text-sm md:text-base text-indigo-100/80 max-w-2xl"
            >
              Drawing visuals, structuring intuition, and preparing guided practice in
              real time.
            </motion.p>

            <div className="mt-9 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
              {equations.map((eq, i) => (
                <motion.div
                  key={eq}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-indigo-100/90"
                  animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.55] }}
                  transition={{
                    duration: 1.4 + i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.08,
                  }}
                >
                  {eq}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 w-[min(560px,86vw)]">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-300 to-violet-400"
                  initial={{ width: "6%" }}
                  animate={{ width: ["14%", "72%", "92%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

