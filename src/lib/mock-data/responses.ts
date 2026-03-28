import { MockResponse } from "@/types/lesson";

/**
 * Prefer longer, concrete phrases as triggers so short words like "what" alone
 * don't hijack unrelated questions. Any trigger substring match picks that card;
 * the longest matching trigger wins globally.
 */
export const mockResponses: MockResponse[] = [
  {
    trigger: [
      "partial derivative",
      "partial derivatives",
      "why differentiate",
      "why we differentiate",
      "rate of change",
    ],
    response:
      "We use derivatives because they describe rate of change — how fast a quantity shifts when you nudge an input. With several variables, partial derivatives answer: “if I wiggle only x (holding y fixed), how does f change?”",
    action: "explain-more",
  },
  {
    trigger: ["slow down", "too fast", "go slower", "slower please", "take your time"],
    response:
      "Absolutely — I'll go more carefully. Tell me which symbol or step feels rushed, and we'll unpack it piece by piece.",
    action: "slow-down",
  },
  {
    trigger: ["say that again", "repeat that", "one more time", "can you repeat"],
    response:
      "Sure — here’s that idea once more, a bit slower. Stop me any time if a word doesn’t land.",
    action: "repeat",
  },
  {
    trigger: [
      "another example",
      "more examples",
      "different example",
      "show me another",
    ],
    response:
      "Here’s another angle: picture standing on a curved surface. The gradient points uphill steepest; following it is like taking the fastest climb at that spot.",
    action: "next-example",
  },
  {
    trigger: [
      "what is the gradient",
      "what does gradient mean",
      "define gradient",
      "gradient vector",
    ],
    response:
      "The gradient packs all partial derivatives into one vector. It points where the function increases fastest, and its length tells you how steep that climb is.",
  },
  {
    trigger: ["real world", "real-world", "applications", "where is this used", "why does this matter"],
    response:
      "You see this in ML (gradient descent), physics fields, heat flow, economics (optimizing under constraints), and graphics — anywhere we optimize or steer direction on a landscape.",
  },
  {
    trigger: [
      "don't understand",
      "dont understand",
      "confused",
      "im lost",
      "i'm lost",
      "not following",
    ],
    response:
      "No worries. Tell me the first word or equation that felt fuzzy — we’ll zoom in only on that, without assuming anything else.",
    action: "explain-more",
  },
  {
    trigger: ["tangent plane", "linear approximation", "best linear approximation"],
    response:
      "The tangent plane is the best flat fit to a surface at one point — same spirit as a tangent line for a curve, but in 2D output.",
  },
  {
    trigger: ["double integral", "volume under", "iterated integral", "integrate over region"],
    response:
      "Double integrals add up a quantity over a 2D region — volume under a surface, total mass, probability, etc. You’re sweeping a small patch and summing contributions.",
  },
  {
    trigger: [
      "lagrange multiplier",
      "lagrange multipliers",
      "constrained optimization",
      "optimize with constraint",
    ],
    response:
      "Lagrange multipliers hunt extrema of f along a constraint g = 0. At the answer, ∇f and ∇g line up — that parallel condition is the key picture.",
  },
  {
    trigger: [
      "need help",
      "can you help",
      "stuck on this",
      "give me a hint",
      "any hints",
    ],
    response:
      "Of course. What have you tried so far, and where did the reasoning stall? Even one sentence helps me target the gap.",
  },
  {
    trigger: [
      "hello",
      "hey there",
      "good morning",
      "good afternoon",
      "thanks",
      "thank you",
      "hi there",
    ],
    response:
      "Hey — glad you’re here. What do you want to tackle first in this topic: big picture, a definition, or a concrete example?",
  },
];

const GENERIC_FALLBACK =
  "That's a thoughtful question! In the context of what we're learning, the key is to focus on how each variable changes independently. Would you like me to elaborate on a specific part?";

const MIN_TRIGGER_LEN = 4;

/** Longest matching trigger wins; ignores triggers shorter than MIN_TRIGGER_LEN (reduces noise). */
export function findBestMockResponse(input: string): {
  match: MockResponse | null;
  score: number;
} {
  const lower = input.toLowerCase();
  let bestMatch: MockResponse | null = null;
  let bestLen = 0;

  for (const response of mockResponses) {
    for (const t of response.trigger) {
      const needle = t.toLowerCase();
      if (needle.length < MIN_TRIGGER_LEN) continue;
      if (!lower.includes(needle)) continue;
      if (needle.length > bestLen) {
        bestLen = needle.length;
        bestMatch = response;
      }
    }
  }

  return { match: bestLen > 0 ? bestMatch : null, score: bestLen };
}

export function findMockResponse(input: string): MockResponse | null {
  const { match, score } = findBestMockResponse(input);
  return score > 0 && match
    ? match
    : { trigger: [], response: GENERIC_FALLBACK };
}
