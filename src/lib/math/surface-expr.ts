import type { Lesson, VisualizationConfig } from "@/types/lesson";

function fallbackFunc(_x: number, _y: number): number {
  return _x * _x + _y * _y;
}

export function attachSurfaceFunction(
  config: VisualizationConfig,
): VisualizationConfig {
  if (config.funcExpr) return config;
  return { ...config, funcExpr: fallbackFunc };
}

export function hydrateLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    visualizationConfig: attachSurfaceFunction(lesson.visualizationConfig),
  };
}
