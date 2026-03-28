const MAX_WORDS = 12;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Buffer LLM token stream → phrase/sentence chunks (~up to 12 words, or . ? !).
 */
export async function* chunkTextStream(
  tokenStream: AsyncIterable<string>,
): AsyncGenerator<string> {
  let buf = "";

  for await (const token of tokenStream) {
    buf += token;

    while (buf.length > 0) {
      const trimmed = buf.trimStart();
      if (!trimmed) {
        buf = "";
        break;
      }

      const sentMatch = trimmed.match(/^([\s\S]+?[.!?])(\s+|$)/);
      if (sentMatch) {
        const chunk = sentMatch[1].trim();
        buf = trimmed.slice(sentMatch[0].length);
        const wc = wordCount(chunk);
        if (wc >= 2 || chunk.length >= 14) {
          yield chunk;
        }
        continue;
      }

      const words = trimmed.split(/\s+/).filter(Boolean);
      if (words.length >= MAX_WORDS) {
        const chunk = words.slice(0, MAX_WORDS).join(" ");
        const rest = words.slice(MAX_WORDS).join(" ");
        buf = rest;
        yield chunk;
        continue;
      }

      break;
    }
  }

  const tail = buf.trim();
  if (tail) yield tail;
}

export async function* readResponseAsTokenStream(
  res: Response,
): AsyncGenerator<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield dec.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}
