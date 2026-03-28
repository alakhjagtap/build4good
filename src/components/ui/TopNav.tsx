"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

export default function TopNav() {
  const { scrollY } = useScroll();
  const navScale = useTransform(scrollY, [0, 160], [1, 0.96]);
  const navY = useTransform(scrollY, [0, 160], [0, -2]);
  const navBlur = useTransform(scrollY, [0, 160], [10, 18]);
  const navOpacity = useTransform(scrollY, [0, 140], [0.72, 0.9]);
  const borderOpacity = useTransform(scrollY, [0, 160], [0.18, 0.36]);
  const blurFilter = useTransform(navBlur, (b) => `blur(${b}px)`);
  const borderColor = useTransform(
    borderOpacity,
    (v) => `rgba(255, 255, 255, ${v})`,
  );

  return (
    <motion.header
      style={{ scale: navScale, y: navY }}
      className="sticky top-3 z-50 mx-auto w-[min(1120px,calc(100%-1rem))] origin-top"
    >
      <motion.div
        style={{
          backdropFilter: blurFilter,
          opacity: navOpacity,
          borderColor,
        }}
        className="relative overflow-hidden rounded-2xl border bg-surface/70 shadow-[0_15px_50px_rgba(15,23,42,0.45)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(99,102,241,0.18),transparent_38%),radial-gradient(circle_at_86%_15%,rgba(56,189,248,0.12),transparent_30%)]" />
        <div className="relative px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-brand-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-semibold text-white tracking-tight">
                Immersa
              </h1>
              <p className="text-[11px] text-indigo-200/70 -mt-0.5 truncate">
                Interactive AI Calculus 3 Studio
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -2, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-indigo-100"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Live lesson generation
          </motion.div>
        </div>
      </motion.div>
    </motion.header>
  );
}

