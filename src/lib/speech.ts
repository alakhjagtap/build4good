"use client";

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}

let activeRecognition: SpeechRecognitionInstance | null = null;

export interface ContinuousListeningOptions {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onIdle?: () => void;
  onIssue?: (code: string) => void;
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function startContinuousListening(opts: ContinuousListeningOptions) {
  stopContinuousListening();

  const SRClass =
    (window as unknown as Record<string, unknown>).SpeechRecognition ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SRClass) {
    opts.onIssue?.("service-not-allowed");
    return;
  }

  const recognition = new (SRClass as { new (): SpeechRecognitionInstance })();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  activeRecognition = recognition;

  let gotFinal = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = "";
    let final = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    if (final.trim()) {
      gotFinal = true;
      opts.onFinal?.(final.trim());
    }
    if (interim.trim()) {
      opts.onInterim?.(interim.trim());
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    const code = event.error;
    if (code === "aborted" || code === "no-speech") {
      return;
    }
    opts.onIssue?.(code);
  };

  recognition.onend = () => {
    if (activeRecognition !== recognition) return;
    activeRecognition = null;
    if (!gotFinal) {
      opts.onIdle?.();
    }
  };

  try {
    recognition.start();
  } catch {
    opts.onIssue?.("audio-capture");
  }
}

export function stopContinuousListening() {
  if (activeRecognition) {
    const ref = activeRecognition;
    activeRecognition = null;
    try {
      ref.abort();
    } catch {
      // already stopped
    }
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis not available"));
      return;
    }

    cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    currentUtterance = utterance;

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = (e) => {
      currentUtterance = null;
      if (e.error === "canceled" || e.error === "interrupted") {
        resolve();
      } else {
        reject(new Error(`Speech synthesis error: ${e.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function cancelSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
