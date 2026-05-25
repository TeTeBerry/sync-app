const SESSION_KEY = "sync_ai_session";
const USER_NAME_KEY = "sync_user_name";
const DEFAULT_USER_NAME = "Zara";

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

/** 客户端展示名称，用于门票挂单等列表展示 */
export function getClientUserName(): string {
  if (typeof localStorage === "undefined") {
    return DEFAULT_USER_NAME;
  }

  const stored = localStorage.getItem(USER_NAME_KEY)?.trim();
  return stored || DEFAULT_USER_NAME;
}

export function persistUserName(name: string): void {
  if (typeof localStorage === "undefined" || !name.trim()) return;
  localStorage.setItem(USER_NAME_KEY, name.trim());
}

export function persistSessionId(sessionId: string): void {
  if (typeof sessionStorage === "undefined" || !sessionId.trim()) return;
  sessionStorage.setItem(SESSION_KEY, sessionId.trim());
}
