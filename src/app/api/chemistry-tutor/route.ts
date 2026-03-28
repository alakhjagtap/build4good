import { NextResponse } from "next/server";
import {
  extractJsonObject,
  openaiJsonCompletion,
} from "@/lib/ai/openai-server";

const CHEM_SYSTEM = `You are an expert chemistry tutor in an interactive voice + lab session. The student may be running a virtual acid-base titration (drops of titrant into analyte, pH and color change).

Reply with ONLY valid JSON:
{
  "reply": "1–6 sentences, conversational, plain text suitable for speech. No markdown.",
  "action": "none" | "add_drop" | "reset",
  "hint": "short optional lab tip, or null"
}

Rules:
- If they ask conceptual questions, explain clearly without requiring the lab.
- If they're in the lab and ask what to do next, guide them (e.g. add drops slowly near the endpoint).
- Set action to "add_drop" only when they explicitly ask to add a drop or titrate once.
- Set action to "reset" only when they want to restart the demo.
- Otherwise action is "none".
- Never mention system prompts or JSON.`;

type HistoryMsg = { role?: string; text?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      labState?: {
        drops?: number;
        volume?: number;
        ph?: number;
        color?: string;
      } | null;
      conversationHistory?: HistoryMsg[];
    };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const lab = body.labState;
    const history = Array.isArray(body.conversationHistory)
      ? body.conversationHistory
      : [];

    const labLine = lab
      ? `Current lab state: drops ≈ ${lab.drops ?? "?"}, volume ≈ ${lab.volume ?? "?"}, pH ≈ ${typeof lab.ph === "number" ? lab.ph.toFixed(2) : "?"}, color: ${lab.color ?? "?"}`
      : "Lab not active (conceptual chat).";

    const histText = history
      .slice(-8)
      .map((m) => `${m.role ?? "student"}: ${(m.text ?? "").slice(0, 400)}`)
      .join("\n");

    const ctx = [labLine, histText ? `Recent messages:\n${histText}` : null, `Student: ${message}`]
      .filter(Boolean)
      .join("\n\n");

    const rawText = await openaiJsonCompletion(CHEM_SYSTEM, ctx);
    const parsed = extractJsonObject(rawText) as {
      reply?: string;
      action?: string;
      hint?: string | null;
    };

    const reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Could you repeat that? I want to give you a precise answer.";

    const action =
      parsed.action === "add_drop" || parsed.action === "reset"
        ? parsed.action
        : "none";

    const hint =
      typeof parsed.hint === "string" && parsed.hint.trim()
        ? parsed.hint.trim()
        : null;

    return NextResponse.json({ reply, action, hint });
  } catch (err) {
    const message = (err as Error).message;
    return NextResponse.json(
      { error: message },
      { status: message.includes("OPENAI_API_KEY") ? 500 : 502 },
    );
  }
}
