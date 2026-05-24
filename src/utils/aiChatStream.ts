import type { AiChatMessage, AiChatStreamEvent } from "../types/aiChat";

function parseSseDataLine(line: string): AiChatStreamEvent | null {
  if (!line.startsWith("data:")) return null;

  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return { type: "done" };

  try {
    const json = JSON.parse(payload) as Record<string, unknown>;

    if (json.type === "error") {
      return { type: "error", message: String(json.message ?? "Unknown error") };
    }
    if (json.type === "done") {
      return { type: "done", messageId: json.messageId as string | undefined };
    }
    if (typeof json.content === "string") {
      return { type: "delta", content: json.content };
    }
    if (typeof json.delta === "string") {
      return { type: "delta", content: json.delta };
    }
  } catch {
    return { type: "delta", content: payload };
  }

  return null;
}

async function* readSseBody(body: ReadableStream<Uint8Array>): AsyncGenerator<AiChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith(":")) continue;

        const event = parseSseDataLine(line);
        if (event) yield event;
      }
    }

    const trailing = buffer.trim();
    if (trailing) {
      const event = parseSseDataLine(trailing);
      if (event) yield event;
    }
  } finally {
    reader.releaseLock();
  }
}

export interface StreamAiChatOptions {
  url: string;
  messages: AiChatMessage[];
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

/** POST + fetch ReadableStream SSE reader (H5). */
export async function* streamAiChatRequest(
  options: StreamAiChatOptions,
): AsyncGenerator<AiChatStreamEvent> {
  const response = await fetch(options.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...options.headers,
    },
    body: JSON.stringify({ messages: options.messages }),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`AI chat failed (${response.status})`);
  }
  if (!response.body) {
    throw new Error("AI chat response has no body");
  }

  yield* readSseBody(response.body);
}

/** Dev fallback: simulate token stream until backend is ready. */
export async function* mockAiChatStream(
  fullText: string,
  options?: { charDelayMs?: number },
): AsyncGenerator<AiChatStreamEvent> {
  const delayMs = options?.charDelayMs ?? 28;

  for (let i = 0; i < fullText.length; ) {
    const chunkSize = Math.min(1 + Math.floor(Math.random() * 2), fullText.length - i);
    yield { type: "delta", content: fullText.slice(i, i + chunkSize) };
    i += chunkSize;

    if (i < fullText.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  yield { type: "done" };
}
