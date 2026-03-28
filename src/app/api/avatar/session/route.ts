import { NextResponse } from "next/server";
import { createLiveAvatarSession, liveAvatarUseSandbox } from "@/lib/avatar";

export async function POST() {
  try {
    const session = await createLiveAvatarSession(liveAvatarUseSandbox());

    return NextResponse.json({
      session_id: session.sessionId,
      livekit_url: session.livekitUrl,
      livekit_token: session.livekitToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[avatar/session]", message);

    const codeMatch = message.match(/"code":\s*(\d+)/);
    const code = codeMatch ? Number(codeMatch[1]) : undefined;

    const status = /API_KEY|not configured/i.test(message) ? 400 : 502;
    return NextResponse.json(
      { error: message, code: code === 4032 ? 4032 : code },
      { status },
    );
  }
}
