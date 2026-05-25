const SESSION_KEY = "sync_ai_session";
const USER_NAME_KEY = "sync_user_name";
const USER_PHONE_KEY = "sync_user_phone";
const DEFAULT_USER_NAME = "Zara";
const DEFAULT_USER_PHONE = "17610941208";

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

/** 客户端绑定手机号，出票时回复「手机」自动填入 */
export function getClientUserPhone(): string {
  if (typeof localStorage === "undefined") {
    return DEFAULT_USER_PHONE;
  }

  const stored = localStorage.getItem(USER_PHONE_KEY)?.trim();
  return stored || DEFAULT_USER_PHONE;
}

export function persistUserPhone(phone: string): void {
  if (typeof localStorage === "undefined" || !phone.trim()) return;
  localStorage.setItem(USER_PHONE_KEY, phone.trim());
}

export function persistUserName(name: string): void {
  if (typeof localStorage === "undefined" || !name.trim()) return;
  localStorage.setItem(USER_NAME_KEY, name.trim());
}

export function persistSessionId(sessionId: string): void {
  if (typeof sessionStorage === "undefined" || !sessionId.trim()) return;
  sessionStorage.setItem(SESSION_KEY, sessionId.trim());
}

/** 清除本地 AI session，配合后端 db:reset 重新开始测试 */
export function clearClientSessionId(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
