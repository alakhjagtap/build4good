"use client";

import { cn } from "@/lib/utils";

/**
 * Layered backdrop: near-black base, subtle dot matrix, faint starfield specks,
 * and a soft vignette — aligned with the landing hero’s technical / cinematic feel
 * (Magic UI–style ambient depth without heavy animation).
 */
export function DashboardBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#050505]" />
      {/* Dot matrix — low contrast */}
      <div
        className="absolute inset-0 opacity-[0.28] immersa-dot-matrix"
        style={{
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 45%, black 20%, transparent 72%)",
        }}
      />
      {/* Faint perspective grid lines */}
      <div
        className="absolute inset-0 opacity-[0.06] immersa-perspective-grid"
        style={{
          maskImage:
            "radial-gradient(ellipse 100% 80% at 50% 40%, black 35%, transparent 75%)",
        }}
      />
      {/* Starfield specks — reuses landing mobile treatment rhythm */}
      <div className="absolute inset-0 immersa-dashboard-stars opacity-[0.22]" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_-10%,transparent_40%,#050505_85%)]" />
    </div>
  );
}
