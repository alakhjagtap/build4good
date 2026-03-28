"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { DesmosSegmentState } from "@/types/lesson";

const DESMOS_API_URL =
  "https://www.desmos.com/api/v1.11/calculator.js?apiKey=cb5e939d2cc5426ca803bc36c8ef03f4";

export interface DesmosHandle {
  applyState: (state: DesmosSegmentState) => void;
  reset: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DesmosCalculator = any;

type DesmosPanelProps = {
  /** Fires once the 3D calculator is ready (use to apply initial lesson state). */
  onReady?: () => void;
};

const DesmosPanel = forwardRef<DesmosHandle, DesmosPanelProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<DesmosCalculator>(null);
  const [loaded, setLoaded] = useState(false);
  const onReadyRef = useRef(props.onReady);
  onReadyRef.current = props.onReady;

  const initCalculator = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Desmos = (window as any).Desmos;
    if (!Desmos || !containerRef.current || calcRef.current) return;

    const calc = Desmos.Calculator3D(containerRef.current);

    calcRef.current = calc;
    setLoaded(true);
    queueMicrotask(() => onReadyRef.current?.());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Desmos) {
      initCalculator();
      return;
    }

    const script = document.createElement("script");
    script.src = DESMOS_API_URL;
    script.async = true;
    script.onload = () => initCalculator();
    document.head.appendChild(script);

    return () => {
      if (calcRef.current) {
        try { calcRef.current.destroy(); } catch { /* ignore */ }
        calcRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeAnimationRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    applyState: (state: DesmosSegmentState) => {
      const calc = calcRef.current;
      if (!calc) return;

      const animationId = ++activeAnimationRef.current;

      // Only clear if we aren't patching
      if (!state.patch) {
        calc.setBlank();
      }

      if (!state?.commands || !Array.isArray(state.commands)) return;

      for (const cmd of state.commands) {
        if (activeAnimationRef.current !== animationId) break;

        const expr: Record<string, unknown> = {
          id: cmd.id,
          latex: cmd.latex || "",
        };
        if (cmd.color) expr.color = cmd.color;
        if (cmd.hidden) expr.hidden = cmd.hidden;
        if (cmd.sliderBounds) expr.sliderBounds = cmd.sliderBounds;

        calc.setExpression(expr);
      }
    },
    reset: () => {
      activeAnimationRef.current++; // Cancel any running animations
      if (calcRef.current) {
        calcRef.current.setBlank();
      }
    },
  }));

  return (
    <div className="relative w-full h-full bg-white">
      <div ref={containerRef} className="w-full h-full [&>div]:!rounded-none" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-xs text-gray-500 font-medium">Loading Desmos Calculator…</span>
          </div>
        </div>
      )}
    </div>
  );
});

DesmosPanel.displayName = "DesmosPanel";
export default DesmosPanel;
