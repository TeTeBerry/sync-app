import Taro from '@tarojs/taro';

const SESSION_KEY = 'sync_ai_session';
const ACTIVITY_SESSION_KEY_PREFIX = 'sync_ai_session_activity_';
const USER_NAME_KEY = 'sync_user_name';
const USER_PHONE_KEY = 'sync_user_phone';
const DEFAULT_USER_NAME = 'Zara';
const DEFAULT_USER_PHONE = '17610941208';

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
  try {
    const value = Taro.getStorageSync(key);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

function writeStoredSessionId(key: string, sessionId: string): void {
  if (!sessionId.trim()) return;
  try {
    Taro.setStorageSync(key, sessionId.trim());
  } catch {
    // storage full or unavailable
  }
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
  return getOrCreateStoredSessionId(SESSION_KEY);
}

export function getOrCreateActivitySessionId(activityLegacyId: number): string {
  return getOrCreateStoredSessionId(activitySessionStorageKey(activityLegacyId));
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
  try {
    const stored = Taro.getStorageSync(USER_NAME_KEY);
    if (typeof stored === 'string' && stored.trim()) {
      cachedUserName = stored.trim();
      return cachedUserName;
    }
  } catch {
    // ignore
  }
  cachedUserName = DEFAULT_USER_NAME;
  return cachedUserName;
}

/** 客户端绑定手机号，出票时回复「手机」自动填入（带缓存） */
export function getClientUserPhone(): string {
  if (cachedUserPhone) return cachedUserPhone;
  try {
    const stored = Taro.getStorageSync(USER_PHONE_KEY);
    if (typeof stored === 'string' && stored.trim()) {
      cachedUserPhone = stored.trim();
      return cachedUserPhone;
    }
  } catch {
    // ignore
  }
  cachedUserPhone = DEFAULT_USER_PHONE;
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
  if (!phone.trim()) return;
  try {
    Taro.setStorageSync(USER_PHONE_KEY, phone.trim());
  } catch {
    // ignore
  }
  cachedUserPhone = undefined;
}

export function persistUserName(name: string): void {
  if (!name.trim()) return;
  try {
    Taro.setStorageSync(USER_NAME_KEY, name.trim());
  } catch {
    // ignore
  }
  cachedUserName = undefined;
}

export function persistSessionId(sessionId: string, activityLegacyId?: number): void {
  const key =
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? activitySessionStorageKey(activityLegacyId)
      : SESSION_KEY;
  writeStoredSessionId(key, sessionId);
  cachedUserId = undefined;
}

/** 清除本地 AI session，配合后端 db:reset 重新开始测试 */
export function clearClientSessionId(): void {
  try {
    Taro.removeStorageSync(SESSION_KEY);
  } catch {
    // ignore
  }
}
