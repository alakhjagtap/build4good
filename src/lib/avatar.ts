/**
 * LiveAvatar API — server-only.
 *
 * Replaces the deprecated HeyGen Streaming Avatar API.
 * Creates a session token then starts the session, returning LiveKit
 * credentials so the client can connect and stream the avatar video.
 *
 * Speech commands (`avatar.speak_text`, `avatar.interrupt`) are sent
 * directly via LiveKit data channels from the client — no REST calls needed.
 */

const LIVEAVATAR_API = "https://api.liveavatar.com";

const SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a"; // Wayne

function requireApiKey(): string {
  const key =
    process.env.LIVEAVATAR_API_KEY ?? process.env.HEYGEN_API_KEY;
  if (!key || key === "your_heygen_api_key_here") {
    throw new Error("HEYGEN_API_KEY (or LIVEAVATAR_API_KEY) is not configured");
  }
  return key;
}

export type LiveAvatarSession = {
  sessionId: string;
  sessionToken: string;
  livekitUrl: string;
  livekitToken: string;
};

export async function createLiveAvatarSession(
  sandbox = true,
): Promise<LiveAvatarSession> {
  const apiKey = requireApiKey();

  // Step 1: Create session token
  const tokenRes = await fetch(`${LIVEAVATAR_API}/v1/sessions/token`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      mode: "FULL",
      avatar_id: SANDBOX_AVATAR_ID,
      is_sandbox: sandbox,
      avatar_persona: {
        language: "en",
        voice: {
          voice_id: "default",
          speed: 1,
          emotion: "neutral",
        },
      },
      interactivity_type: "PUSH_TO_TALK",
      video_settings: {
        quality: "medium",
        encoding: "H264",
      },
    }),
  });

  const tokenJson = (await tokenRes.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  if (!tokenRes.ok) {
    throw new Error(
      `LiveAvatar token ${tokenRes.status}: ${JSON.stringify(tokenJson)}`,
    );
  }

  const tokenData = (tokenJson.data ?? tokenJson) as Record<string, unknown>;
  const sessionId = tokenData.session_id as string | undefined;
  const sessionToken = tokenData.session_token as string | undefined;

  if (!sessionId || !sessionToken) {
    throw new Error(
      `LiveAvatar token missing fields: ${JSON.stringify(tokenJson)}`,
    );
  }

  // Step 2: Start the session
  const startRes = await fetch(`${LIVEAVATAR_API}/v1/sessions/start`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  const startJson = (await startRes.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  if (!startRes.ok) {
    throw new Error(
      `LiveAvatar start ${startRes.status}: ${JSON.stringify(startJson)}`,
    );
  }

  const startData = (startJson.data ?? startJson) as Record<string, unknown>;
  const livekitUrl = startData.livekit_url as string | undefined;
  const livekitToken = startData.livekit_client_token as string | undefined;

  if (!livekitUrl || !livekitToken) {
    throw new Error(
      `LiveAvatar start missing fields: ${JSON.stringify(startJson)}`,
    );
  }

  return { sessionId, sessionToken, livekitUrl, livekitToken };
}
