const listeners = new Set<() => void>();

/** Subscribe to login / logout (storage changed). */
export function subscribeAuthSessionChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyAuthSessionChange(): void {
  for (const listener of listeners) {
    listener();
  }
}
