"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Target,
  BarChart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Atom,
  Cpu,
  Globe2,
  Landmark,
  Dna,
  Sigma,
  Brain,
} from "lucide-react";
import { useLessonStore } from "@/lib/lesson-engine";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardBackground } from "./DashboardBackground";

function NavItem({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 border px-3 py-2.5 text-left font-mono text-xs uppercase tracking-wider transition-all duration-200",
        active
          ? "border-white/25 bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_0_24px_-8px_rgba(255,255,255,0.12)]"
          : "border-transparent text-zinc-500 hover:border-white/10 hover:bg-white/[0.03] hover:text-zinc-200",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 stroke-[1.25]",
          active ? "text-zinc-200" : "text-zinc-600 group-hover:text-zinc-400",
        )}
      />
      {label}
    </button>
  );
}

function ProgressMetric({
  label,
  value,
  widthPct,
}: {
  label: string;
  value: string;
  widthPct: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        <span className="text-zinc-200">{value}</span>
      </div>
      <div className="h-1 w-full overflow-hidden border border-white/10 bg-black/40">
        <div
          className="h-full bg-gradient-to-r from-zinc-500 via-zinc-300 to-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

export function Dashboard({ onChemistry }: { onChemistry: () => void }) {
  const { loadLesson } = useLessonStore();
  const [activeSection, setActiveSection] = useState<"dashboard" | "courses">(
    "dashboard",
  );

  const startDemo = () => {
    loadLesson("gradient vectors");
  };

  const courses: {
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
    mono?: string;
    Icon?: LucideIcon;
    onClick: () => void;
  }[] = [
    {
      id: "calc3",
      title: "Calculus III",
      subtitle: "Multivariable Functions",
      mono: "C3",
      onClick: startDemo,
    },
    {
      id: "chem-lab",
      title: "Chemistry",
      subtitle: "Titration Lab · Immersive 3D",
      badge: "New",
      Icon: FlaskConical,
      onClick: onChemistry,
    },
    {
      id: "physics",
      title: "Physics",
      subtitle: "Mechanics, Energy & Waves",
      Icon: Atom,
      onClick: startDemo,
    },
    {
      id: "cs",
      title: "Computer Science",
      subtitle: "Algorithms & Data Structures",
      Icon: Cpu,
      onClick: startDemo,
    },
    {
      id: "econ",
      title: "Economics",
      subtitle: "Micro & Market Models",
      Icon: Globe2,
      onClick: startDemo,
    },
    {
      id: "history",
      title: "History",
      subtitle: "World History & Historiography",
      Icon: Landmark,
      onClick: startDemo,
    },
    {
      id: "bio",
      title: "Biology",
      subtitle: "Cell Biology & Genetics",
      Icon: Dna,
      onClick: startDemo,
    },
    {
      id: "stats",
      title: "Statistics",
      subtitle: "Probability & Inference",
      Icon: Sigma,
      onClick: startDemo,
    },
    {
      id: "psych",
      title: "Psychology",
      subtitle: "Cognition & Behavior",
      Icon: Brain,
      onClick: startDemo,
    },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#050505] font-sans text-zinc-100">
      <DashboardBackground />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mb-10 px-6 pt-6">
          <div className="font-mono text-xl font-bold tracking-widest text-white italic transform -skew-x-12">
            IMMERSA
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          <NavItem
            active={activeSection === "dashboard"}
            onClick={() => setActiveSection("dashboard")}
            icon={LayoutDashboard}
            label="Dashboard"
          />
          <NavItem
            active={activeSection === "courses"}
            onClick={() => setActiveSection("courses")}
            icon={Users}
            label="My Courses"
          />
          <NavItem active={false} icon={Target} label="Goals" />
          <NavItem active={false} icon={BarChart} label="Progress" />
          <NavItem active={false} icon={Calendar} label="Sessions" />
        </nav>

        <div className="mt-auto border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-600">
            <span className="opacity-70">∞</span>
            <div className="h-px flex-1 bg-white/10" />
            <span>IMMERSA.ENGINE_V1</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="mx-auto max-w-5xl space-y-8">
          {activeSection === "dashboard" ? (
            <>
              <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 opacity-70">
                    <div className="h-px w-6 bg-white" />
                    <span className="font-mono text-[10px] tracking-wider text-zinc-500">
                      ∞
                    </span>
                    <div className="h-px flex-1 max-w-[120px] bg-white/30" />
                  </div>
                  <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.12em] text-white md:text-3xl">
                    Dashboard
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                    Your immersive lab workspace. CHEM 117 tracks how you work
                    through acid–base titration with the 3D sim and AI tutor.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onChemistry}
                  className="h-auto shrink-0 gap-2 rounded-none border border-white/90 bg-transparent px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-white hover:bg-white hover:text-black"
                >
                  <FlaskConical className="h-4 w-4" />
                  Continue CHEM 117 Lab
                </Button>
              </header>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                {[
                  {
                    title: "Lab module",
                    icon: FlaskConical,
                    value: "CHEM 117",
                    hint: "Acid–base titration · 3D lab",
                  },
                  {
                    title: "Lab sessions",
                    icon: Calendar,
                    value: "6",
                    hint: "Guided runs completed",
                  },
                  {
                    title: "Tutor alignment",
                    icon: Target,
                    value: "91%",
                    hint: "Avg. steps followed vs. suggested",
                  },
                ].map((s) => (
                  <Card
                    key={s.title}
                    className="transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.035]"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <s.icon className="h-4 w-4 stroke-[1.25]" />
                        <CardTitle className="text-[11px] font-medium text-zinc-400">
                          {s.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div
                        className={cn(
                          "font-mono font-bold tracking-tight text-white",
                          s.value.length > 4
                            ? "text-2xl md:text-3xl"
                            : "text-4xl",
                        )}
                      >
                        {s.value}
                      </div>
                      <CardDescription className="mt-1 text-xs text-zinc-600">
                        {s.hint}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Latest session — featured panel */}
              <Card className="overflow-hidden border-white/15 bg-gradient-to-b from-white/[0.04] to-transparent">
                <div className="relative border-b border-white/10 px-6 py-4">
                  <div className="absolute left-0 top-0 h-full w-1 immersa-dither-rail opacity-50" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Session log · Latest
                      </p>
                      <h2 className="mt-1 font-mono text-lg font-bold uppercase tracking-wide text-white">
                        Latest Session
                      </h2>
                    </div>
                      <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                        <Calendar className="h-4 w-4 text-zinc-600" />
                        <span>Mar 28, 2:40 PM · CHEM 117 · Titration lab</span>
                      </div>
                      <span className="border border-white/25 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300">
                        completed
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-8 pt-8">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Strong acid–strong base run (0.1 M NaOH vs. HCl, phenolphthalein).
                    You connected{" "}
                    <span className="text-zinc-300">burette volume</span> to moles of
                    titrant, narrated the approach to{" "}
                    <span className="text-zinc-300">pH ≈ 7</span> at equivalence, and
                    described the indicator’s pink transition without overshooting.
                    The 3D stream and live pH readout matched your verbal checkpoints
                    — solid lab reasoning session.
                  </p>

                  <div className="space-y-6">
                    <ProgressMetric
                      label="Procedure engagement"
                      value="90%"
                      widthPct={90}
                    />
                    <ProgressMetric
                      label="Concept link (volume → moles → pH)"
                      value="88%"
                      widthPct={88}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-8 md:grid-cols-2">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-white">
                        <CheckCircle2 className="h-5 w-5 text-zinc-400" />
                        Strengths
                      </h3>
                      <ul className="space-y-3 text-sm leading-relaxed text-zinc-500">
                        <li>
                          Clear tie between{" "}
                          <span className="text-zinc-400">drops / mL added</span> and
                          the moving equivalence point on the curve.
                        </li>
                        <li>
                          Correct read on{" "}
                          <span className="text-zinc-400">phenolphthalein</span> —
                          colorless in acid, pink after the endpoint in base.
                        </li>
                        <li>
                          Paused pours near the steep part of the curve; tutor
                          prompts matched your pacing.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-white">
                        <AlertCircle className="h-5 w-5 text-zinc-500" />
                        To improve
                      </h3>
                      <ul className="space-y-3 text-sm leading-relaxed text-zinc-500">
                        <li>
                          Add titrant more slowly in the last ~1 mL so the indicator
                          shift is easier to catch on the first run.
                        </li>
                        <li>
                          Practice sketching the titration curve shape before the
                          next lab — reinforces where the slope is steepest.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                    <span>RECORD_ID · CHEM117-TITR-2026-03-28-1440</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-white/50" />
                      SYNCED
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <header>
                <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.12em] text-white">
                  My Courses
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Pick a course to continue where you left off.
                </p>
              </header>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {courses.map((c) => {
                  const CourseIcon = c.Icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={c.onClick}
                      className={cn(
                        "group relative flex min-h-[100px] cursor-pointer items-center gap-4 overflow-hidden border border-white/10 bg-white/[0.02] p-6 text-left transition-all hover:border-white/25 hover:bg-white/[0.04]",
                        c.badge && "pr-14",
                      )}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/15 bg-black/40 font-mono text-sm font-bold text-white">
                        {CourseIcon ? (
                          <CourseIcon className="h-6 w-6 stroke-[1.25]" />
                        ) : (
                          c.mono
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-white">
                          {c.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-600">{c.subtitle}</p>
                      </div>
                      {c.badge ? (
                        <span className="absolute right-3 top-3 border border-white/20 bg-black/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                          {c.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
