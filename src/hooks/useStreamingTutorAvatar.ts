"use client";

import { useCallback, useRef, useState } from "react";
import {
  chunkTextStream,
  readResponseAsTokenStream,
} from "@/lib/stream-chunker";

const DEFAULT_INTER_CHUNK_MS = 160;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type StreamingTutorOptions = {
  sessionId: string | null;
  tutorUrl?: string;
  interChunkDelayMs?: number;
};

/**
 * Streams tutor text, chunks it, POSTs each chunk to /api/avatar/speak sequentially.
 * Abort by calling interrupt() or passing a new request (auto-aborts previous).
 */
export function useStreamingTutorAvatar({
  sessionId,
  tutorUrl = "/api/tutor/stream",
  interChunkDelayMs = DEFAULT_INTER_CHUNK_MS,
}: StreamingTutorOptions) {
  const [assistantDraft, setAssistantDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const interrupt = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }, []);

  const submit = useCallback(
    async (userMessage: string) => {
      if (!sessionId?.trim()) return;
      interrupt();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);
      setAssistantDraft("");

      const sent = new Set<string>();

      try {
        const res = await fetch(tutorUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
          signal: ac.signal,
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }

        const tokenStream = readResponseAsTokenStream(res);

        for await (const chunk of chunkTextStream(tokenStream)) {
          if (ac.signal.aborted) break;
          const key = chunk.trim();
          if (!key || sent.has(key)) continue;
          sent.add(key);

          setAssistantDraft((d) => d + (d ? " " : "") + chunk);

          const speakRes = await fetch("/api/avatar/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, text: chunk }),
            signal: ac.signal,
          });
          if (!speakRes.ok) {
            throw new Error(await speakRes.text());
          }

          await sleep(interChunkDelayMs);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        console.warn("[useStreamingTutorAvatar]", e);
      } finally {
        if (abortRef.current === ac) abortRef.current = null;
        setBusy(false);
      }
    },
    [sessionId, tutorUrl, interChunkDelayMs, interrupt],
  );

  return { submit, interrupt, busy, assistantDraft };
}
