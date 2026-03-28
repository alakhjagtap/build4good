/** Shared lesson / tutor domain types (used by engine, UI, and mock data). */

export type VisualizationType =
  | "surface-gradient"
  | "partial-derivatives"
  | "tangent-plane"
  | "double-integral"
  | "lagrange-multipliers";

export interface VisualizationSlider {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface VisualizationToggle {
  id: string;
  label: string;
  defaultValue: boolean;
}

export interface VisualizationConfig {
  type: VisualizationType;
  func?: string;
  funcExpr?: (x: number, y: number) => number;
  surfaceExpr?: string;
  xRange: [number, number];
  yRange: [number, number];
  zRange?: [number, number];
  initialPoint: [number, number];
  showGradient?: boolean;
  showTangentPlane?: boolean;
  showContours?: boolean;
  showConstraint?: boolean;
  constraintFunc?: string;
  /** Optional numeric constraint surface for Lagrange / constraint viz */
  constraintExpr?: (x: number, y: number) => number;
  colorScheme?: string;
  sliders?: VisualizationSlider[];
  toggles?: VisualizationToggle[];
}

export interface DesmosCommand {
  id: string;
  latex: string;
  color?: string;
  hidden?: boolean;
  sliderBounds?: { min: number; max: number; step: number };
}

export interface DesmosSegmentState {
  commands: DesmosCommand[];
}

export type LessonSegmentType =
  | "hook"
  | "intuition"
  | "breakdown"
  | "visual-demo"
  | "worked-example"
  | "practice"
  | "recap";

export interface LessonSegment {
  id: string;
  type: LessonSegmentType;
  title: string;
  content: string;
  duration: number;
  formula?: string;
  visualState?: Record<string, unknown>;
  captionText?: string;
  desmosState?: DesmosSegmentState;
}

export interface BreakdownStep {
  id: string;
  title: string;
  explanation: string;
  formula?: string;
  visualState?: Record<string, unknown>;
  duration: number;
}

export interface WorkedExampleStep {
  text: string;
  formula?: string;
  visualState?: Record<string, unknown>;
}

export interface WorkedExample {
  problem: string;
  steps: WorkedExampleStep[];
  answer: string;
}

export interface GuidedPractice {
  problem: string;
  hints: string[];
  solution: string;
  solutionSteps: string[];
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  hook: string;
  intuition: string;
  keyFormulas: { label: string; formula: string }[];
  breakdownSteps: BreakdownStep[];
  visualizationType: VisualizationType;
  visualizationConfig: VisualizationConfig;
  workedExample: WorkedExample;
  guidedPractice: GuidedPractice;
  recap: string;
  commonMistakes: string[];
  segments: LessonSegment[];
}

export type AdaptiveAction = "simpler-explanation" | "another-example";

export interface AdaptiveState {
  pauseCount: number;
  replayCount: number;
  followUpCount: number;
  currentSegmentReplays: number;
  suggestedAction: AdaptiveAction | null;
}

export interface MockResponse {
  trigger: string[];
  response: string;
  action?: string;
}
