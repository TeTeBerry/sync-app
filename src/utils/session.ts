const SESSION_KEY = "sync_ai_session";

export function getOrCreateSessionId(): string {
  if (typeof sessionStorage === "undefined") {
    return `guest-${Date.now()}`;
  }

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

/** 客户端用户标识，用于拼单加入/退出等接口 */
export function getClientUserId(): string {
  return getOrCreateSessionId();
}
