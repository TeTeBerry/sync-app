import Taro from '@tarojs/taro';
import { ApiError } from './apiClient';

const STORAGE_KEY = 'auth.h5.smsCooldown';
const DEFAULT_COOLDOWN_SEC = 60;

export type SmsCooldownRecord = {
  phone: string;
  nextAllowedAt: number;
};

export function readSmsCooldownRecord(): SmsCooldownRecord | null {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY) as SmsCooldownRecord | undefined;
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.phone !== 'string' || typeof raw.nextAllowedAt !== 'number') {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export function saveSmsCooldownRecord(phone: string, seconds: number): void {
  const nextAllowedAt = Date.now() + Math.max(1, seconds) * 1000;
  Taro.setStorageSync(STORAGE_KEY, {
    phone,
    nextAllowedAt,
  } satisfies SmsCooldownRecord);
}

export function clearSmsCooldownRecord(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
  } catch {
    // ignore storage failures in H5 private mode, etc.
  }
}

export function getSmsCooldownSeconds(phone?: string): number {
  const record = readSmsCooldownRecord();
  if (!record) return 0;
  if (phone && record.phone !== phone) return 0;
  const diffMs = record.nextAllowedAt - Date.now();
  if (diffMs <= 0) {
    clearSmsCooldownRecord();
    return 0;
  }
  return Math.ceil(diffMs / 1000);
}

function parseDurationSeconds(message: string): number | null {
  const secondMatch = message.match(/(\d+)\s*(?:秒|s(?:ec(?:ond)?s?)?)/i);
  if (secondMatch) {
    return Number(secondMatch[1]);
  }
  const minuteMatch = message.match(/(\d+)\s*(?:分钟|min(?:ute)?s?)/i);
  if (minuteMatch) {
    return Number(minuteMatch[1]) * 60;
  }
  return null;
}

export function resolveSmsCooldownSeconds(error: unknown): number | null {
  if (error instanceof ApiError) {
    const parsed = parseDurationSeconds(error.message);
    if (parsed && parsed > 0) {
      return parsed;
    }
    if (error.status === 429) {
      return DEFAULT_COOLDOWN_SEC;
    }
  }

  if (error instanceof Error) {
    const parsed = parseDurationSeconds(error.message);
    if (parsed && parsed > 0) {
      return parsed;
    }
  }

  return null;
}
