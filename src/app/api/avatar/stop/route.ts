import { NextResponse } from "next/server";
import { stopLiveAvatarSession } from "@/lib/avatar";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { session_id?: string };
    const id = typeof body.session_id === "string" ? body.session_id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }
    await stopLiveAvatarSession(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[avatar/stop]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
