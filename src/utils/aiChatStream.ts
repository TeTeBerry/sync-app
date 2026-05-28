import type { AiChatStreamEvent } from "../types/aiChat";

export { parseStreamEventPayload } from "./aiChatStreamEvents";

export async function* mockAiChatStream(
  fullText: string,
): AsyncGenerator<AiChatStreamEvent> {
  if (fullText) {
    yield { type: "delta", content: fullText };
  }
  yield { type: "done" };
}
