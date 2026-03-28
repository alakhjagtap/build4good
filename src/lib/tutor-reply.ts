import { findBestMockResponse } from "@/lib/mock-data/responses";
import type { Lesson, LessonSegment } from "@/types/lesson";

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

const ADVANCE_RE =
  /\b(next|continue|move on|go ahead|keep going|proceed|next step|next part|what'?s next|go on)\b/i;

/** User explicitly wants the lesson to advance to the next section. */
export function shouldAdvanceLessonStep(message: string): boolean {
  return ADVANCE_RE.test(message);
}

/** After this reply, move currentSegmentIndex forward (e.g. “another example”). */
function mockImpliesAdvance(
  action: string | undefined,
): boolean {
  return action === "next-example";
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "you",
  "are",
  "was",
  "but",
  "not",
  "can",
  "how",
  "why",
  "what",
  "when",
  "who",
  "did",
  "does",
  "this",
  "that",
  "with",
  "from",
  "into",
  "about",
  "have",
  "your",
  "our",
  "they",
  "them",
  "its",
  "got",
  "get",
  "use",
]);

function keywordSet(message: string): Set<string> {
  const out = new Set<string>();
  for (const raw of message.toLowerCase().split(/\W+/)) {
    if (raw.length < 4) continue;
    if (STOPWORDS.has(raw)) continue;
    out.add(raw);
  }
  return out;
}

/** Pick the lesson segment whose text overlaps most with the user’s words. */
function segmentBestAlignedWithUser(
  lesson: Lesson,
  userMessage: string,
  fallback: LessonSegment | null,
): { segment: LessonSegment; overlap: number } {
  const words = keywordSet(userMessage);
  const segments = lesson.segments;
  if (segments.length === 0) {
    const fake = fallback ?? {
      id: "x",
      type: "hook" as const,
      title: lesson.title,
      content: lesson.hook,
      duration: 1,
    };
    return { segment: fake, overlap: 0 };
  }

  let bestIdx = 0;
  let bestOverlap = -1;
  const fbIdx = fallback
    ? segments.findIndex((s) => s.id === fallback.id)
    : -1;
  if (fbIdx >= 0) bestIdx = fbIdx;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const hay = `${s.title}\n${s.content}\n${s.captionText ?? ""}`.toLowerCase();
    let o = 0;
    for (const w of words) {
      if (hay.includes(w)) o++;
    }
    if (o > bestOverlap) {
      bestOverlap = o;
      bestIdx = i;
    }
  }

  return { segment: segments[bestIdx], overlap: Math.max(0, bestOverlap) };
}

export type TutorReplyResult = {
  text: string;
  /** After speaking, increment segment index (mock “another path” or similar). */
  advanceSegmentAfterReply: boolean;
};

/** Opening line when the live avatar connects. */
export function buildSessionIntro(lesson: Lesson): string {
  const seg = lesson.segments[0];
  const bite =
    seg?.captionText ??
    clip(seg?.content ?? lesson.hook ?? lesson.intuition, 320);
  return `Hi! I'm here with you live. We're working on ${lesson.title}. ${bite}`;
}

/**
 * Tutor reply tied to what the user actually said: keyword FAQs first, otherwise
 * echo + lesson overlap (no blind reading of a fixed script).
 */
export function buildLiveTutorReply(
  userMessage: string,
  lesson: Lesson | null,
  currentSegment: LessonSegment | null,
): TutorReplyResult {
  const trimmed = userMessage.trim();
  const { match, score } = findBestMockResponse(trimmed);
  if (match && score > 0) {
    return {
      text: match.response,
      advanceSegmentAfterReply: mockImpliesAdvance(match.action),
    };
  }

  if (!lesson) {
    return {
      text: `You said “${clip(trimmed, 160)}”. Once you pick a topic from the home screen, I’ll connect that question to the lesson material directly.`,
      advanceSegmentAfterReply: false,
    };
  }

  const { segment: aligned, overlap } = segmentBestAlignedWithUser(
    lesson,
    trimmed,
    currentSegment,
  );
  const brief = clip(trimmed, 140);

  const idea = clip(
    aligned.captionText ?? aligned.content ?? lesson.intuition,
    260,
  );

  if (overlap > 0) {
    return {
      text: `You said “${brief}”. That lines up most closely with **${aligned.title}** in this lesson: ${idea} Tell me which piece you want to stress-test—notation, picture, or a mini-example.`,
      advanceSegmentAfterReply: false,
    };
  }

  return {
    text: `You said “${brief}”. I’m not locking you to a script—right now we’re in **${aligned.title}**. ${idea} What word or step should we unpack so it matches what you meant?`,
    advanceSegmentAfterReply: false,
  };
}
