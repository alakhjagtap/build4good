"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";

const SPEEDS = [1, 1.5, 2] as const;

export default function PlaybackControls() {
  const {
    currentLesson,
    currentSegmentIndex,
    isPlaying,
    segmentProgress,
    voiceEnabled,
    togglePlay,
    nextSegment,
    prevSegment,
    goToSegment,
    setVoiceEnabled,
  } = useLessonStore();

  const [speedIdx, setSpeedIdx] = useState(0);

  const segments = currentLesson?.segments ?? [];
  const totalDuration = useMemo(
    () => segments.reduce((s, seg) => s + seg.duration, 0),
    [segments],
  );

  const currentSeg = segments[currentSegmentIndex] ?? null;

  const cycleSpeed = useCallback(() => {
    setSpeedIdx((prev) => (prev + 1) % SPEEDS.length);
  }, []);

  if (!currentLesson) return null;

  const elapsedInSegment = currentSeg
    ? Math.round(currentSeg.duration * segmentProgress)
    : 0;
  const elapsedBefore = segments
    .slice(0, currentSegmentIndex)
    .reduce((s, seg) => s + seg.duration, 0);
  const totalElapsed = elapsedBefore + elapsedInSegment;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-2xl bg-surface-50/80 backdrop-blur-xl border border-white/10 shadow-2xl px-6 py-4">
          {/* Timeline scrubber */}
          <div className="flex items-center gap-1 mb-4 h-2 rounded-full overflow-hidden bg-surface/60">
            {segments.map((seg, i) => {
              const widthPct = totalDuration > 0 ? (seg.duration / totalDuration) * 100 : 0;
              const isCurrent = i === currentSegmentIndex;
              const isPast = i < currentSegmentIndex;

              return (
                <button
                  key={seg.id}
                  onClick={() => goToSegment(i)}
                  title={seg.title}
                  style={{ width: `${widthPct}%` }}
                  className={`
                    relative h-full rounded-sm transition-all duration-300 min-w-[4px]
                    ${
                      isCurrent
                        ? "bg-brand-500"
                        : isPast
                          ? "bg-brand-500/40"
                          : "bg-white/10"
                    }
                  `}
                >
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-brand-400 rounded-sm"
                      style={{ width: `${segmentProgress * 100}%` }}
                      layout
                      transition={{ duration: 0.1 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {/* Time display */}
            <span className="text-xs text-gray-500 tabular-nums w-24 text-right">
              {formatTime(totalElapsed)} / {formatTime(totalDuration)}
            </span>

            {/* Transport controls */}
            <div className="flex items-center gap-2 mx-auto">
              <button
                onClick={prevSegment}
                disabled={currentSegmentIndex <= 0}
                className="p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="
                  w-12 h-12 rounded-full flex items-center justify-center
                  bg-brand-500 hover:bg-brand-600 text-white
                  shadow-[0_0_20px_rgba(99,102,241,0.3)]
                  transition-all duration-200
                "
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSegment}
                disabled={currentSegmentIndex >= segments.length - 1}
                className="p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 w-24">
              <button
                onClick={cycleSpeed}
                className="text-xs font-mono font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
              >
                {SPEEDS[speedIdx]}x
              </button>

              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled
                    ? "text-brand-400 hover:text-brand-300"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Segment label */}
          {currentSeg && (
            <p className="text-center text-xs text-gray-500 mt-3">
              Step {currentSegmentIndex + 1} of {segments.length}:{" "}
              <span className="text-gray-400">{currentSeg.title}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
