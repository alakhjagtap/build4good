/* eslint-disable @typescript-eslint/no-explicit-any */

let recognition: any = null;
let continuousRecognition: any = null;

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

function getSpeechRecognitionConstructor(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  const win = window as any;
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

/** Errors that are normal / recoverable — don't treat as app bugs. */
function isBenignSpeechError(code: string): boolean {
  return code === "no-speech" || code === "aborted";
}

/**
 * Chrome/Chromium often uses a network speech backend; "network" is common when
 * offline, on VPN, or the provider is briefly unreachable.
 */
function isSoftSpeechError(code: string): boolean {
  return (
    code === "network" ||
    code === "service-not-allowed" ||
    code === "not-allowed" ||
    code === "audio-capture"
  );
}

export function startListening(
  onResult: (text: string) => void,
  onEnd?: () => void,
): void {
  stopListening();

  const Ctor = getSpeechRecognitionConstructor();
  if (!Ctor) {
    console.warn("SpeechRecognition is not supported in this browser.");
    return;
  }

  recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    const last = event.results[event.results.length - 1];
    if (last?.isFinal) {
      onResult(last[0].transcript.trim());
    }
  };

  recognition.onerror = (event: any) => {
    const code = String(event.error ?? "");
    if (isBenignSpeechError(code)) return;
    if (isSoftSpeechError(code)) {
      console.warn(
        `[speech] ${code} — recognition may retry. Check connection / mic permission, or type instead.`,
      );
      return;
    }
    console.warn("[speech]", code);
  };

  recognition.onend = () => {
    recognition = null;
    onEnd?.();
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.abort();
    recognition = null;
  }
}

export interface ContinuousListenOptions {
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
  /** Fired when the browser ends the recognition session (e.g. pause). Restart here to keep dictating. */
  onIdle?: () => void;
  /** Soft failures (network, permissions) — show a hint; dictation may auto-restart via onIdle. */
  onIssue?: (code: string) => void;
}

/** Long-running dictation: emits a final transcript for each spoken phrase. */
export function startContinuousListening(options: ContinuousListenOptions): void {
  stopContinuousListening();

  const Ctor = getSpeechRecognitionConstructor();
  if (!Ctor) {
    console.warn("SpeechRecognition is not supported in this browser.");
    return;
  }

  continuousRecognition = new Ctor();
  continuousRecognition.continuous = true;
  continuousRecognition.interimResults = true;
  continuousRecognition.lang = "en-US";

  continuousRecognition.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const piece = result[0]?.transcript ?? "";
      if (result.isFinal) {
        const trimmed = piece.trim();
        if (trimmed) options.onFinal(trimmed);
      } else {
        interim += piece;
      }
    }
    if (options.onInterim) {
      options.onInterim(interim.trim());
    }
  };

  continuousRecognition.onerror = (event: any) => {
    const code = String(event.error ?? "");
    if (isBenignSpeechError(code)) return;
    if (isSoftSpeechError(code)) {
      console.warn(
        `[speech] ${code} — Web Speech often needs internet (Chrome). Dictation will retry; you can type meanwhile.`,
      );
      options.onIssue?.(code);
      return;
    }
    console.warn("[speech]", code);
    options.onIssue?.(code);
  };

  continuousRecognition.onend = () => {
    continuousRecognition = null;
    options.onIdle?.();
  };

  try {
    continuousRecognition.start();
  } catch {
    continuousRecognition = null;
  }
}

export function stopContinuousListening(): void {
  if (continuousRecognition) {
    try {
      continuousRecognition.stop();
    } catch {
      try {
        continuousRecognition.abort();
      } catch {
        // ignore
      }
    }
    continuousRecognition = null;
  }
}

export function speak(text: string, rate: number = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("SpeechSynthesis is not supported."));
      return;
    }

    cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = "en-US";

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        resolve();
      } else {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function cancelSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
