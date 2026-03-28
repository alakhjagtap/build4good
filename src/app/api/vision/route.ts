import { NextResponse } from "next/server";
import {
  extractJsonObject,
  openaiVisionJsonCompletion,
} from "@/lib/ai/openai-server";

const VISION_SYSTEM = `You are an expert mathematical vision system.
Analyze the provided image (likely a webcam feed of a whiteboard or paper).
Detect any handwritten mathematical equations.

Return ONLY valid JSON:
{
  "equations": [
    { "latex": "y = x^2 - 4x + 3", "confidence": 0.95 }
  ]
}

Rules:
- If no math is found, return an empty array.
- Focus strictly on math. Ignore background objects.
- Return ONLY JSON.`;

export async function POST(req: Request) {
  try {
    const { image } = (await req.json()) as { image: string };
    if (!image) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const rawText = await openaiVisionJsonCompletion(VISION_SYSTEM, "Analyze the handwriting in this image.", image);
    const parsed = extractJsonObject(rawText) as { equations: any[] };

    return NextResponse.json(parsed);
  } catch (err) {
    const message = (err as Error).message;
    console.error("[vision API error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
