import { create } from "zustand";
import type {
  Lesson,
  LessonSegment,
  AdaptiveState,
  AdaptiveAction,
} from "@/types/lesson";
import { findLesson } from "@/lib/mock-data/lessons";

interface LessonStore {
  currentLesson: Lesson | null;
  currentSegmentIndex: number;
  segmentProgress: number;
  isPlaying: boolean;
  voiceEnabled: boolean;
  lastVoiceResponse: string;
  showAdaptivePrompt: boolean;
  adaptive: AdaptiveState;

  getCurrentSegment: () => LessonSegment | null;
  loadLesson: (query: string) => void;
  togglePlay: () => void;
  pause: () => void;
  nextSegment: () => void;
  prevSegment: () => void;
  goToSegment: (index: number) => void;
  setSegmentProgress: (progress: number) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceResponse: (text: string) => void;
  recordFollowUp: () => void;
  dismissAdaptive: () => void;
}

const INITIAL_ADAPTIVE: AdaptiveState = {
  pauseCount: 0,
  replayCount: 0,
  followUpCount: 0,
  currentSegmentReplays: 0,
  suggestedAction: null,
};

function computeAdaptiveSuggestion(state: AdaptiveState): AdaptiveAction | null {
  if (state.currentSegmentReplays >= 2) return "simpler-explanation";
  if (state.followUpCount >= 3) return "another-example";
  return null;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  currentLesson: null,
  currentSegmentIndex: 0,
  segmentProgress: 0,
  isPlaying: false,
  voiceEnabled: true,
  lastVoiceResponse: "",
  showAdaptivePrompt: false,
  adaptive: { ...INITIAL_ADAPTIVE },

  getCurrentSegment: () => {
    const { currentLesson, currentSegmentIndex } = get();
    if (!currentLesson) return null;
    return currentLesson.segments[currentSegmentIndex] ?? null;
  },

  loadLesson: (query: string) => {
    if (query === "__reset__") {
      set({
        currentLesson: null,
        currentSegmentIndex: 0,
        segmentProgress: 0,
        isPlaying: false,
        lastVoiceResponse: "",
        showAdaptivePrompt: false,
        adaptive: { ...INITIAL_ADAPTIVE },
      });
      return;
    }

    const lesson = findLesson(query);
    if (!lesson) {
      console.warn("[lesson-engine] No lesson found for:", query);
      return;
    }

    set({
      currentLesson: lesson,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      isPlaying: false, // Don't auto-advance
      lastVoiceResponse: "",
      showAdaptivePrompt: false,
      adaptive: { ...INITIAL_ADAPTIVE },
    });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  pause: () => set({ isPlaying: false }),

  nextSegment: () => {
    const { currentLesson, currentSegmentIndex } = get();
    if (!currentLesson) return;
    const maxIdx = currentLesson.segments.length - 1;
    if (currentSegmentIndex >= maxIdx) return;
    set({
      currentSegmentIndex: currentSegmentIndex + 1,
      segmentProgress: 0,
      adaptive: {
        ...get().adaptive,
        currentSegmentReplays: 0,
      },
    });
  },

  prevSegment: () => {
    const { currentSegmentIndex } = get();
    if (currentSegmentIndex <= 0) return;
    set({
      currentSegmentIndex: currentSegmentIndex - 1,
      segmentProgress: 0,
      adaptive: {
        ...get().adaptive,
        currentSegmentReplays: 0,
      },
    });
  },

  goToSegment: (index: number) => {
    const { currentLesson } = get();
    if (!currentLesson) return;
    const clamped = Math.max(0, Math.min(index, currentLesson.segments.length - 1));
    set({
      currentSegmentIndex: clamped,
      segmentProgress: 0,
      adaptive: {
        ...get().adaptive,
        currentSegmentReplays: 0,
      },
    });
  },

  setSegmentProgress: (progress: number) => {
    set({ segmentProgress: Math.max(0, Math.min(1, progress)) });
  },

  setVoiceEnabled: (enabled: boolean) => {
    set({ voiceEnabled: enabled });
  },

  setVoiceResponse: (text: string) => {
    set({ lastVoiceResponse: text });
  },

  recordFollowUp: () => {
    const adaptive = { ...get().adaptive };
    adaptive.followUpCount += 1;
    const suggested = computeAdaptiveSuggestion(adaptive);
    adaptive.suggestedAction = suggested;
    set({
      adaptive,
      showAdaptivePrompt: suggested !== null,
    });
  },

  dismissAdaptive: () => {
    set((state) => ({
      showAdaptivePrompt: false,
      adaptive: {
        ...state.adaptive,
        suggestedAction: null,
        followUpCount: 0,
        currentSegmentReplays: 0,
      },
    }));
  },
}));
