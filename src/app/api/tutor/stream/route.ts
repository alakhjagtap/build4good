/**
 * Demo streaming tutor: replace with your LLM (OpenAI stream, etc.).
 * Emits plain text chunks for chunkTextStream.
 */

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let message = "";
  try {
    const b = (await req.json()) as { message?: string };
    message = typeof b.message === "string" ? b.message : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const reply = `Let's connect that to your lesson. You asked about "${message.slice(0, 120)}". ` +
    `In multivariable calculus, we often use partial derivatives to see how a surface changes ` +
    `when we move along one axis at a time. The gradient packages those partials into one vector ` +
    `that points uphill. Does that match what you were thinking, or should we zoom in on definitions?`;

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < reply.length; i++) {
        controller.enqueue(encoder.encode(reply[i]));
        await new Promise((r) => setTimeout(r, 8));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
