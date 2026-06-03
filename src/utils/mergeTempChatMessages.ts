import type { TempChatMessage } from '../types/tempChat';

function sortByCreatedAt(messages: TempChatMessage[]): TempChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function messagesEqual(a: TempChatMessage, b: TempChatMessage): boolean {
  return (
    a.id === b.id &&
    a.sessionId === b.sessionId &&
    a.role === b.role &&
    a.body === b.body &&
    a.createdAt === b.createdAt
  );
}

/** Merge server/local lists by id; reuse `prev` reference when nothing changed. */
export function mergeTempChatMessages(
  prev: TempChatMessage[],
  incoming: TempChatMessage[],
): TempChatMessage[] {
  if (incoming.length === 0) {
    return prev.length === 0 ? prev : [];
  }
  if (prev.length === 0) {
    return sortByCreatedAt(incoming);
  }

  const byId = new Map<string, TempChatMessage>();
  for (const message of prev) {
    byId.set(message.id, message);
  }

  let changed = prev.length !== incoming.length;
  for (const message of incoming) {
    const existing = byId.get(message.id);
    if (!existing) {
      byId.set(message.id, message);
      changed = true;
      continue;
    }
    if (!messagesEqual(existing, message)) {
      byId.set(message.id, message);
      changed = true;
    }
  }

  if (!changed) {
    const sameOrder = incoming.every(
      (message, index) => prev[index]?.id === message.id,
    );
    if (sameOrder) return prev;
  }

  const merged = sortByCreatedAt([...byId.values()]);
  if (
    merged.length === prev.length &&
    merged.every((message, index) => messagesEqual(message, prev[index]!))
  ) {
    return prev;
  }

  return merged;
}
