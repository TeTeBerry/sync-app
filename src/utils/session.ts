const SESSION_KEY = "sync_ai_session";
const ACTIVITY_SESSION_KEY_PREFIX = "sync_ai_session_activity_";
const USER_NAME_KEY = "sync_user_name";
const USER_PHONE_KEY = "sync_user_phone";
const DEFAULT_USER_NAME = "Zara";
const DEFAULT_USER_PHONE = "17610941208";

function createSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function activitySessionStorageKey(activityLegacyId: number): string {
  return `${ACTIVITY_SESSION_KEY_PREFIX}${activityLegacyId}`;
}

function readStoredSessionId(key: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(key);
}

function writeStoredSessionId(key: string, sessionId: string): void {
  if (typeof sessionStorage === "undefined" || !sessionId.trim()) return;
  sessionStorage.setItem(key, sessionId.trim());
}

function getOrCreateStoredSessionId(key: string): string {
  const existing = readStoredSessionId(key);
  if (existing) return existing;

  const id = createSessionId();
  writeStoredSessionId(key, id);
  return id;
}

function createFreshStoredSessionId(key: string): string {
  const id = createSessionId();
  writeStoredSessionId(key, id);
  return id;
}

export function createFreshSessionId(): string {
  return createFreshStoredSessionId(SESSION_KEY);
}

export function getOrCreateSessionId(): string {
  if (typeof sessionStorage === "undefined") {
    return `guest-${Date.now()}`;
  }
  return getOrCreateStoredSessionId(SESSION_KEY);
}

export function getOrCreateActivitySessionId(activityLegacyId: number): string {
  if (typeof sessionStorage === "undefined") {
    return `guest-activity-${activityLegacyId}-${Date.now()}`;
  }
  return getOrCreateStoredSessionId(
    activitySessionStorageKey(activityLegacyId),
  );
}

export function createFreshActivitySessionId(activityLegacyId: number): string {
  return createFreshStoredSessionId(activitySessionStorageKey(activityLegacyId));
}

/** 客户端用户标识 */
export function getClientUserId(): string {
  return getOrCreateSessionId();
}

/** 客户端展示名称 */
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

export function persistSessionId(
  sessionId: string,
  activityLegacyId?: number,
): void {
  const key =
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? activitySessionStorageKey(activityLegacyId)
      : SESSION_KEY;
  writeStoredSessionId(key, sessionId);
}

/** 清除本地 AI session，配合后端 db:reset 重新开始测试 */
export function clearClientSessionId(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
