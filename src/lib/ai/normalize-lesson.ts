import type {
  BreakdownStep,
  GuidedPractice,
  Lesson,
  LessonSegment,
  VisualizationConfig,
  VisualizationType,
  WorkedExample,
} from "@/types/lesson";

const VIS_TYPES: VisualizationType[] = [
  "surface-gradient",
  "partial-derivatives",
  "tangent-plane",
  "double-integral",
  "lagrange-multipliers",
];

const SEG_TYPES: LessonSegment["type"][] = [
  "hook",
  "intuition",
  "breakdown",
  "visual-demo",
  "worked-example",
  "practice",
  "recap",
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56) || "lesson";
}

function asStr(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function asStrOpt(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asNum(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asPair(v: unknown, fallback: [number, number]): [number, number] {
  if (!Array.isArray(v) || v.length < 2) return fallback;
  const a = Number(v[0]);
  const b = Number(v[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return fallback;
  return [a, b];
}

function normalizeVisType(v: unknown): VisualizationType {
  const s = typeof v === "string" ? v : "";
  return VIS_TYPES.includes(s as VisualizationType)
    ? (s as VisualizationType)
    : "surface-gradient";
}

function defaultSlidersForType(
  type: VisualizationType,
  initial: [number, number],
): VisualizationConfig["sliders"] {
  const [ix, iy] = initial;
  const common = [
    {
      id: "point-x",
      label: "Point X",
      min: -2.5,
      max: 2.5,
      step: 0.1,
      defaultValue: Math.max(-2.5, Math.min(2.5, ix)),
    },
    {
      id: "point-y",
      label: "Point Y",
      min: -2.5,
      max: 2.5,
      step: 0.1,
      defaultValue: Math.max(-2.5, Math.min(2.5, iy)),
    },
  ];
  if (type === "double-integral") {
    return [
      {
        id: "x-upper",
        label: "X Upper Limit",
        min: 0.5,
        max: 2,
        step: 0.1,
        defaultValue: 1,
      },
      {
        id: "y-upper",
        label: "Y Upper Limit",
        min: 0.5,
        max: 2,
        step: 0.1,
        defaultValue: 1,
      },
    ];
  }
  if (type === "lagrange-multipliers") {
    return [
      {
        id: "constraint-c",
        label: "Constraint Value (c)",
        min: 1,
        max: 6,
        step: 0.5,
        defaultValue: 4,
      },
    ];
  }
  return common;
}

function defaultTogglesForType(
  type: VisualizationType,
): VisualizationConfig["toggles"] {
  switch (type) {
    case "surface-gradient":
      return [
        {
          id: "show-gradient",
          label: "Show Gradient Vector",
          defaultValue: true,
        },
        { id: "show-contours", label: "Show Contour Lines", defaultValue: true },
        {
          id: "show-tangent-plane",
          label: "Show Tangent Plane",
          defaultValue: false,
        },
      ];
    case "partial-derivatives":
      return [
        { id: "show-x-slice", label: "Show x-slice", defaultValue: true },
        { id: "show-y-slice", label: "Show y-slice", defaultValue: true },
        {
          id: "show-contours",
          label: "Show Contour Lines",
          defaultValue: false,
        },
      ];
    case "tangent-plane":
      return [
        {
          id: "show-tangent-plane",
          label: "Show Tangent Plane",
          defaultValue: true,
        },
        { id: "show-normal", label: "Show Normal Vector", defaultValue: false },
      ];
    case "double-integral":
      return [
        { id: "show-slices", label: "Show Slices", defaultValue: true },
        { id: "show-volume", label: "Shade Volume", defaultValue: true },
      ];
    case "lagrange-multipliers":
      return [
        { id: "show-gradients", label: "Show Gradients", defaultValue: true },
        {
          id: "show-contours",
          label: "Show Level Curves",
          defaultValue: true,
        },
        {
          id: "show-constraint",
          label: "Show Constraint",
          defaultValue: true,
        },
      ];
    default:
      return [];
  }
}

function normalizeVisualization(
  raw: unknown,
  query: string,
  topLevelType?: unknown,
): VisualizationConfig {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const type = normalizeVisType(o.type ?? topLevelType);
  const initialPoint = asPair(o.initialPoint, [1, 1]);
  const surfaceExpr = asStrOpt(o.surfaceExpr);
  const func = asStrOpt(o.func);

  const config: VisualizationConfig = {
    type,
    func: func ?? surfaceExpr ?? "x^2 + y^2",
    surfaceExpr: surfaceExpr ?? func?.replace(/·/g, "*"),
    xRange: asPair(o.xRange, [-3, 3]) as [number, number],
    yRange: asPair(o.yRange, [-3, 3]) as [number, number],
    zRange: o.zRange
      ? (asPair(o.zRange, [0, 10]) as [number, number])
      : undefined,
    initialPoint,
    showGradient:
      typeof o.showGradient === "boolean" ? o.showGradient : undefined,
    showTangentPlane:
      typeof o.showTangentPlane === "boolean" ? o.showTangentPlane : undefined,
    showContours:
      typeof o.showContours === "boolean" ? o.showContours : undefined,
    showConstraint:
      typeof o.showConstraint === "boolean" ? o.showConstraint : undefined,
    constraintFunc: asStrOpt(o.constraintFunc),
    colorScheme: asStrOpt(o.colorScheme),
    sliders: Array.isArray(o.sliders)
      ? (o.sliders as VisualizationConfig["sliders"])
      : undefined,
    toggles: Array.isArray(o.toggles)
      ? (o.toggles as VisualizationConfig["toggles"])
      : undefined,
  };

  if (!config.sliders?.length) {
    config.sliders = defaultSlidersForType(type, initialPoint);
  }
  if (!config.toggles?.length) {
    config.toggles = defaultTogglesForType(type);
  }

  if (!config.surfaceExpr?.trim()) {
    config.surfaceExpr =
      type === "double-integral"
        ? "4 - x^2 - y^2"
        : type === "tangent-plane"
          ? "sin(x) * y"
          : type === "partial-derivatives"
            ? "sin(x) * cos(y)"
            : "x^2 + y^2";
  }

  if (type === "surface-gradient") {
    if (config.showGradient === undefined) config.showGradient = true;
    if (config.showContours === undefined) config.showContours = true;
  }

  if (query && !config.func) config.func = config.surfaceExpr;

  return config;
}

function normalizeSegment(raw: unknown, i: number): LessonSegment {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const segType = o.type;
  const type: LessonSegment["type"] =
    typeof segType === "string" && SEG_TYPES.includes(segType as LessonSegment["type"])
      ? (segType as LessonSegment["type"])
      : "breakdown";

  return {
    id: asStr(o.id, `seg-${i}-${type}`),
    type,
    title: asStr(o.title, `Step ${i + 1}`),
    content: asStr(o.content, ""),
    formula: asStrOpt(o.formula),
    duration: Math.max(8, asNum(o.duration, 15)),
    visualState:
      o.visualState && typeof o.visualState === "object"
        ? (o.visualState as LessonSegment["visualState"])
        : undefined,
    captionText: asStrOpt(o.captionText),
  };
}

function normalizeBreakdownStep(raw: unknown, i: number): BreakdownStep {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: asStr(o.id, `bd-${i}`),
    title: asStr(o.title, `Step ${i + 1}`),
    explanation: asStr(o.explanation, ""),
    formula: asStrOpt(o.formula),
    visualState:
      o.visualState && typeof o.visualState === "object"
        ? (o.visualState as BreakdownStep["visualState"])
        : undefined,
    duration: Math.max(5, asNum(o.duration, 10)),
  };
}

function normalizeWorkedExample(raw: unknown): WorkedExample {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const stepsRaw = Array.isArray(o.steps) ? o.steps : [];
  const steps = stepsRaw.map((s, i) => {
    const st =
      s && typeof s === "object" ? (s as Record<string, unknown>) : {};
    return {
      text: asStr(st.text, ""),
      formula: asStrOpt(st.formula),
      visualState:
        st.visualState && typeof st.visualState === "object"
          ? (st.visualState as WorkedExample["steps"][0]["visualState"])
          : undefined,
    };
  });
  return {
    problem: asStr(o.problem, "Work through a representative example."),
    steps:
      steps.length > 0
        ? steps
        : [{ text: "Work carefully step by step." }],
    answer: asStr(o.answer, ""),
  };
}

function normalizePractice(raw: unknown): GuidedPractice {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const hints = Array.isArray(o.hints)
    ? o.hints.map((h) => (typeof h === "string" ? h : String(h)))
    : ["Break the problem into smaller steps."];
  const solutionSteps = Array.isArray(o.solutionSteps)
    ? o.solutionSteps.map((s) => (typeof s === "string" ? s : String(s)))
    : [asStr(o.solution, "See your instructor or text.")];

  return {
    problem: asStr(o.problem, "Try a related problem."),
    hints,
    solution: asStr(o.solution, ""),
    solutionSteps,
  };
}

export function normalizeLessonPayload(raw: unknown, query: string): Lesson {
  if (!raw || typeof raw !== "object") {
    throw new Error("Lesson payload must be a JSON object");
  }

  const o = raw as Record<string, unknown>;

  const title = asStr(o.title, query);
  const id = asStr(o.id, slugify(query));
  const concept = asStr(o.concept, title);

  const segmentsRaw = Array.isArray(o.segments) ? o.segments : [];
  const segments =
    segmentsRaw.length > 0
      ? segmentsRaw.map((s, i) => normalizeSegment(s, i))
      : [
          normalizeSegment(
            {
              id: "hook",
              type: "hook",
              title: "Introduction",
              content: asStr(o.hook, title),
              duration: 15,
            },
            0,
          ),
        ];

  const keyFormulasRaw = Array.isArray(o.keyFormulas) ? o.keyFormulas : [];
  const keyFormulas =
    keyFormulasRaw.length > 0
      ? keyFormulasRaw.map((kf, i) => {
          const row =
            kf && typeof kf === "object" ? (kf as Record<string, unknown>) : {};
          return {
            label: asStr(row.label, `Formula ${i + 1}`),
            formula: asStr(row.formula, ""),
          };
        })
      : [];

  const breakdownRaw = Array.isArray(o.breakdownSteps) ? o.breakdownSteps : [];
  const breakdownSteps =
    breakdownRaw.length > 0
      ? breakdownRaw.map((b, i) => normalizeBreakdownStep(b, i))
      : [
          {
            id: "bd-1",
            title: "Core idea",
            explanation: asStr(o.intuition, segments[0]?.content ?? ""),
            duration: 10,
          },
        ];

  const commonMistakes = Array.isArray(o.commonMistakes)
    ? o.commonMistakes.map((m) => (typeof m === "string" ? m : String(m)))
    : [];

  const visualizationConfig = normalizeVisualization(
    o.visualizationConfig ?? {},
    query,
    o.visualizationType,
  );

  return {
    id,
    title,
    concept,
    hook: asStr(o.hook, segments[0]?.content ?? `Introduction to ${title}`),
    intuition: asStr(
      o.intuition,
      segments.find((s) => s.type === "intuition")?.content ?? "",
    ),
    keyFormulas,
    breakdownSteps,
    visualizationType: visualizationConfig.type,
    visualizationConfig,
    workedExample: normalizeWorkedExample(o.workedExample),
    guidedPractice: normalizePractice(o.guidedPractice),
    recap: asStr(
      o.recap,
      segments.find((s) => s.type === "recap")?.content ?? "",
    ),
    commonMistakes,
    segments,
  };
}