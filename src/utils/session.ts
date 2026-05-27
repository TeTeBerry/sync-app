const SESSION_KEY = "sync_ai_session";
const ACTIVITY_SESSION_KEY_PREFIX = "sync_ai_session_activity_";
const USER_NAME_KEY = "sync_user_name";
const USER_PHONE_KEY = "sync_user_phone";
const DEFAULT_USER_NAME = "Zara";
const DEFAULT_USER_PHONE = "17610941208";

let cachedUserId: string | undefined;
let cachedUserName: string | undefined;
let cachedUserPhone: string | undefined;

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

/** 客户端用户标识（带缓存） */
export function getClientUserId(): string {
  if (cachedUserId) return cachedUserId;
  cachedUserId = getOrCreateSessionId();
  return cachedUserId;
}

/** 客户端展示名称（带缓存） */
export function getClientUserName(): string {
  if (cachedUserName) return cachedUserName;
  if (typeof localStorage === "undefined") {
    return DEFAULT_USER_NAME;
  }
  const stored = localStorage.getItem(USER_NAME_KEY)?.trim();
  cachedUserName = stored || DEFAULT_USER_NAME;
  return cachedUserName;
}

/** 客户端绑定手机号，出票时回复「手机」自动填入（带缓存） */
export function getClientUserPhone(): string {
  if (cachedUserPhone) return cachedUserPhone;
  if (typeof localStorage === "undefined") {
    return DEFAULT_USER_PHONE;
  }
  const stored = localStorage.getItem(USER_PHONE_KEY)?.trim();
  cachedUserPhone = stored || DEFAULT_USER_PHONE;
  return cachedUserPhone;
}

/** 清除用户信息缓存（在修改名称/手机/session 后调用） */
export function clearClientUserCache(): void {
  cachedUserId = undefined;
  cachedUserName = undefined;
  cachedUserPhone = undefined;
}

/** API 请求通用的 owner 参数 */
export function ownerParams() {
  return {
    userId: getClientUserId(),
    authorName: getClientUserName(),
  };
}

export function persistUserPhone(phone: string): void {
  if (typeof localStorage === "undefined" || !phone.trim()) return;
  localStorage.setItem(USER_PHONE_KEY, phone.trim());
  cachedUserPhone = undefined;
}

export function persistUserName(name: string): void {
  if (typeof localStorage === "undefined" || !name.trim()) return;
  localStorage.setItem(USER_NAME_KEY, name.trim());
  cachedUserName = undefined;
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
  cachedUserId = undefined;
}

/** 清除本地 AI session，配合后端 db:reset 重新开始测试 */
export function clearClientSessionId(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
