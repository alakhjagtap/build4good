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
  isPlaying: boolean;
  playbackProgress: number;
  segmentProgress: number;
  adaptive: AdaptiveState;
  voiceEnabled: boolean;
  isListening: boolean;
  lastVoiceResponse: string | null;
  showAdaptivePrompt: boolean;

  loadLesson: (query: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextSegment: () => void;
  prevSegment: () => void;
  goToSegment: (index: number) => void;
  setSegmentProgress: (progress: number) => void;
  recordPause: () => void;
  recordReplay: () => void;
  recordFollowUp: () => void;
  setVoiceResponse: (response: string) => void;
  dismissAdaptive: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setIsListening: (listening: boolean) => void;
  getCurrentSegment: () => LessonSegment | null;
}

const initialAdaptive: AdaptiveState = {
  pauseCount: 0,
  replayCount: 0,
  followUpCount: 0,
  currentSegmentReplays: 0,
  suggestedAction: null,
};

function computeSuggestedAction(adaptive: AdaptiveState): AdaptiveAction | null {
  if (adaptive.pauseCount >= 3 || adaptive.currentSegmentReplays >= 2) {
    return "simpler-explanation";
  }
  if (adaptive.followUpCount >= 3) {
    return "another-example";
  }
  return null;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  currentLesson: null,
  currentSegmentIndex: 0,
  isPlaying: false,
  playbackProgress: 0,
  segmentProgress: 0,
  adaptive: { ...initialAdaptive },
  voiceEnabled: true,
  isListening: false,
  lastVoiceResponse: null,
  showAdaptivePrompt: false,

  loadLesson: (query: string) => {
    const lesson = findLesson(query);
    set({
      currentLesson: lesson,
      currentSegmentIndex: 0,
      isPlaying: false,
      playbackProgress: 0,
      segmentProgress: 0,
      adaptive: { ...initialAdaptive },
      lastVoiceResponse: null,
      showAdaptivePrompt: false,
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextSegment: () =>
    set((state) => {
      const segments = state.currentLesson?.segments;
      if (!segments) return state;
      const nextIndex = state.currentSegmentIndex + 1;
      if (nextIndex >= segments.length) return state;
      return {
        currentSegmentIndex: nextIndex,
        segmentProgress: 0,
        adaptive: { ...state.adaptive, currentSegmentReplays: 0 },
      };
    }),

  prevSegment: () =>
    set((state) => {
      if (state.currentSegmentIndex <= 0) return state;
      return {
        currentSegmentIndex: state.currentSegmentIndex - 1,
        segmentProgress: 0,
        adaptive: { ...state.adaptive, currentSegmentReplays: 0 },
      };
    }),

  goToSegment: (index: number) =>
    set((state) => {
      const segments = state.currentLesson?.segments;
      if (!segments || index < 0 || index >= segments.length) return state;
      return {
        currentSegmentIndex: index,
        segmentProgress: 0,
        adaptive: { ...state.adaptive, currentSegmentReplays: 0 },
      };
    }),

  setSegmentProgress: (progress: number) =>
    set({ segmentProgress: Math.max(0, Math.min(1, progress)) }),

  recordPause: () =>
    set((state) => {
      const updated: AdaptiveState = {
        ...state.adaptive,
        pauseCount: state.adaptive.pauseCount + 1,
      };
      const suggestedAction = computeSuggestedAction(updated);
      updated.suggestedAction = suggestedAction;
      return { adaptive: updated, showAdaptivePrompt: suggestedAction !== null };
    }),

  recordReplay: () =>
    set((state) => {
      const updated: AdaptiveState = {
        ...state.adaptive,
        replayCount: state.adaptive.replayCount + 1,
        currentSegmentReplays: state.adaptive.currentSegmentReplays + 1,
      };
      const suggestedAction = computeSuggestedAction(updated);
      updated.suggestedAction = suggestedAction;
      return { adaptive: updated, showAdaptivePrompt: suggestedAction !== null };
    }),

  recordFollowUp: () =>
    set((state) => {
      const updated: AdaptiveState = {
        ...state.adaptive,
        followUpCount: state.adaptive.followUpCount + 1,
      };
      const suggestedAction = computeSuggestedAction(updated);
      updated.suggestedAction = suggestedAction;
      return { adaptive: updated, showAdaptivePrompt: suggestedAction !== null };
    }),

  setVoiceResponse: (response: string) =>
    set({ lastVoiceResponse: response }),

  dismissAdaptive: () =>
    set((state) => ({
      showAdaptivePrompt: false,
      adaptive: { ...state.adaptive, suggestedAction: null },
    })),

  setVoiceEnabled: (enabled: boolean) => set({ voiceEnabled: enabled }),
  setIsListening: (listening: boolean) => set({ isListening: listening }),

  getCurrentSegment: () => {
    const { currentLesson, currentSegmentIndex } = get();
    if (!currentLesson) return null;
    return currentLesson.segments[currentSegmentIndex] ?? null;
  },
}));
