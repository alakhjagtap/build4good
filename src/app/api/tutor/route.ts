import { NextResponse } from "next/server";
import {
  extractJsonObject,
  openaiJsonCompletion,
} from "@/lib/ai/openai-server";

const TUTOR_SYSTEM = `You are an adaptive, patient Calculus 3 tutor leading an interactive session.
The student is in charge. If they ask to see a graph, plot something, or see an example, you MUST generate the corresponding Desmos state.

Reply with ONLY valid JSON:
{
  "reply": "your conversational response. Keep it brief (1-3 sentences) so you don't 'yap'. Speak naturally.",
  "desmosState": { 
     "commands": [ 
        {"id": "obj1", "latex": "z = x^2 + y^2", "color": "#6366f1"},
        {"id": "obj2", "latex": "(1,1,2)", "color": "#fbbf24"}
     ] 
  }
}

Interactivity Rules:
1. If the student asks "plot X" or "show me Y", include those equations in "desmosState".
2. Use "desmosState" to illustrate every concept you explain. 
3. Stay focused on the student's immediate question. Avoid lecturing; be a guide.
4. If you don't have a specific graph to show, you can omit "desmosState" or keep the previous one.
5. Never use markdown code blocks. Return ONLY the raw JSON object.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      history?: any[];
      lessonTitle?: string;
      lessonConcept?: string;
      segment?: { title?: string; type?: string; content?: string } | null;
    };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const hist = Array.isArray(body.history) ? body.history : [];
    const formattedHistory = hist.slice(-6).map((h: any) => `${h.role === 'student' ? 'Student' : 'Tutor'}: ${h.text}`).join("\n");

    const ctx = [
      body.lessonTitle ? `Current Lesson Topic: ${body.lessonTitle} (${body.lessonConcept ?? ""})` : null,
      body.segment ? `Current Segment Context: ${body.segment.content ?? ""}` : null,
      formattedHistory ? `Previous Conversation:\n${formattedHistory}` : null,
      `Student's latest input: ${message}`,
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
