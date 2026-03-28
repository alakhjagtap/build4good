export function getOpenAIApiKey(): string | null {
  return (
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_API_KEY?.trim() ||
    null
  );
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export async function openaiJsonCompletion(
  system: string,
  user: string,
): Promise<string> {
  const key = getOpenAIApiKey();
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env or .env.local at the project root.",
    );
  }

  const model = getOpenAIModel();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.55,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text?.trim()) {
    throw new Error("Empty response from OpenAI");
  }
  return text.trim();
}

export async function openaiVisionJsonCompletion(
  system: string,
  user: string,
  imageBase64: string, // assumes 'data:image/jpeg;base64,...' format
): Promise<string> {
  const key = getOpenAIApiKey();
  if (!key) throw new Error("OPENAI_API_KEY is not set.");
  
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: user },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "auto" }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error("Empty response from OpenAI");
  return text.trim();
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const block = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (block?.[1] ?? trimmed).trim();
  return JSON.parse(raw) as unknown;
}
