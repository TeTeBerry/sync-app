import type { AiChatMessage, AiChatStreamEvent } from "../types/aiChat";

function parseSseDataLine(line: string): AiChatStreamEvent | null {
  if (!line.startsWith("data:")) return null;

  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return { type: "done" };

  try {
    const json = JSON.parse(payload) as Record<string, unknown>;

    if (json.type === "error") {
      return {
        type: "error",
        message: String(json.message ?? "Unknown error"),
      };
    }
    if (json.type === "delta" && typeof json.content === "string") {
      return { type: "delta", content: json.content };
    }
    if (json.type === "done") {
      return {
        type: "done",
        messageId: json.messageId as string | undefined,
        sessionId: json.sessionId as string | undefined,
      };
    }
    if (json.type === "post_created" && typeof json.postId === "string") {
      return {
        type: "post_created",
        postId: json.postId,
        activityLegacyId:
          typeof json.activityLegacyId === "number"
            ? json.activityLegacyId
            : undefined,
      };
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

async function* readSseBody(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AiChatStreamEvent> {
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
  sessionId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  activityLegacyId?: number;
  image?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

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
    body: JSON.stringify({
      messages: options.messages,
      sessionId: options.sessionId,
      userId: options.userId,
      userName: options.userName,
      userPhone: options.userPhone,
      activityLegacyId: options.activityLegacyId,
      image: options.image,
    }),
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

export async function* mockAiChatStream(
  fullText: string,
): AsyncGenerator<AiChatStreamEvent> {
  if (fullText) {
    yield { type: "delta", content: fullText };
  }
  yield { type: "done" };
}
