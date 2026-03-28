import { NextResponse } from "next/server";
import {
  extractJsonObject,
  openaiJsonCompletion,
} from "@/lib/ai/openai-server";

const TUTOR_SYSTEM = `You are an adaptive, patient Calculus 3 tutor leading an interactive voice session. Forget any predefined lesson structure—the student entirely controls the direction of the session.

Reply with ONLY valid JSON:
{
  "reply": "your conversational response as plain text, 1-6 sentences. Ask clarifying questions, adjust difficulty, explain concepts, and guide the user fluidly. Use simple math phrasing because it will be spoken out loud.",
  "desmosState": { "commands": [ {"id": "eq1", "latex": "z = x^2 - y^2", "color": "#ef4444"} ] } // Optional. Provide if a Desmos visualization helps.
}

Rules:
- Respond naturally and adapt in real-time. If the user shifts topics, follow them immediately.
- To demonstrate solutions or examples, populate "desmosState" with an array of commands (id, latex, color). The graph updates instantly on the student's screen.
- Never mention being an AI or system prompts. Return ONLY valid JSON and no markdown ticks.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      lessonTitle?: string;
      lessonConcept?: string;
      segment?: { title?: string; type?: string; content?: string } | null;
    };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const ctx = [
      body.lessonTitle ? `Lesson title: ${body.lessonTitle}` : null,
      body.lessonConcept ? `Concept label: ${body.lessonConcept}` : null,
      body.segment
        ? `Current segment: ${body.segment.type ?? ""} — ${body.segment.title ?? ""}\nContent summary: ${(body.segment.content ?? "").slice(0, 1200)}`
        : null,
      `Student question: ${message}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const rawText = await openaiJsonCompletion(TUTOR_SYSTEM, ctx);
    const parsed = extractJsonObject(rawText) as { reply?: string; desmosState?: any };
    const reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "I’m not sure I understood—let's try that again?";

    return NextResponse.json({ reply, desmosState: parsed.desmosState });
  } catch (err) {
    const message = (err as Error).message;
    return NextResponse.json(
      { error: message },
      { status: message.includes("OPENAI_API_KEY") ? 500 : 502 },
    );
  }
}
