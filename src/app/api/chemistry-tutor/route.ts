import { NextResponse } from "next/server";
import {
  extractJsonObject,
  openaiJsonCompletion,
} from "@/lib/ai/openai-server";

const CHEM_SYSTEM = `You are a warm, expert chemistry tutor in a live AI tutoring session. You guide students through chemistry concepts and hands-on virtual lab experiments.

Context: You are in a live interactive session. The student may be:
1. Just starting — answer their question naturally and conversationally
2. Working in a virtual titration lab (strong acid–strong base: 0.1 M NaOH burette, 50 mL 0.1 M HCl with phenolphthalein indicator)
3. Asking general chemistry questions

Reply with ONLY valid JSON matching this schema:
{
  "reply": "Your response (1–6 sentences). Be conversational, encouraging, and clear.",
  "action": "none" | "add_drop" | "reset" | "observe",
  "hint": "Optional short hint or null"
}

Rules:
- Be warm and conversational — like a real tutor sitting next to them
- If they are in the lab, describe visual cues (color changes, solution levels)
- Guide them toward the equivalence point (pH 7) and explain the indicator behavior
- Keep responses concise — avoid walls of text
- Never ask the student to paste a lab protocol
- If they ask for titration, acid/base, experiment, or lab help, move forward with a default acid-base titration walkthrough
- Use action "add_drop" when suggesting they add a drop
- Use action "observe" when they should watch carefully
- Use action "reset" only if they want to start over
- Do NOT provide commentary on every single drop — let them experiment freely
- Only give unsolicited feedback at milestones (pH 5, 6, 6.5, 7, 7.5, 8)
- If no lab state is provided, this is a general conversation — respond naturally`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      labState?: {
        drops: number;
        volume: number;
        ph: number;
        color: string;
      };
      conversationHistory?: Array<{ role: string; text: string }>;
    };

    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const parts: string[] = [];

    if (body.labState) {
      const s = body.labState;
      parts.push(
        `Current lab state: ${s.drops} drops added, ${s.volume.toFixed(2)} mL NaOH delivered, pH = ${s.ph.toFixed(2)}, solution color = ${s.color}`,
      );
    }

    if (body.conversationHistory?.length) {
      const recent = body.conversationHistory.slice(-6);
      parts.push(
        "Recent conversation:\n" +
          recent.map((m) => `${m.role}: ${m.text}`).join("\n"),
      );
    }

    parts.push(`Student says: ${message}`);
    const ctx = parts.join("\n\n");

    const rawText = await openaiJsonCompletion(CHEM_SYSTEM, ctx);
    const parsed = extractJsonObject(rawText) as {
      reply?: string;
      action?: string;
      hint?: string;
    };

    const reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "I didn't quite catch that. Could you say that again?";

    return NextResponse.json({
      reply,
      action: parsed.action ?? "none",
      hint: parsed.hint ?? null,
    });
  } catch (err) {
    const message = (err as Error).message;
    return NextResponse.json(
      { error: message },
      { status: message.includes("OPENAI_API_KEY") ? 500 : 502 },
    );
  }
}
