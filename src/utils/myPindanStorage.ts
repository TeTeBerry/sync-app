import Taro from "@tarojs/taro";
import type { ProfilePinDanItem } from "../pages/profile/mockData";

const STORAGE_KEY = "profile.myPindan.joined";

function readStored(): ProfilePinDanItem[] {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    return Array.isArray(raw) ? (raw as ProfilePinDanItem[]) : [];
  } catch {
    return [];
  }
}

/** 合并用户新加入的拼单与默认 mock 数据 */
export function loadMyPindanItems(defaults: ProfilePinDanItem[]): ProfilePinDanItem[] {
  const stored = readStored();
  const storedIds = new Set(stored.map((item) => item.id));
  const remaining = defaults.filter((item) => !storedIds.has(item.id));
  return [...stored, ...remaining];
}

export function saveJoinedPindanItem(item: ProfilePinDanItem): void {
  const stored = readStored();
  if (stored.some((entry) => entry.id === item.id)) return;
  Taro.setStorageSync(STORAGE_KEY, [item, ...stored]);
}

export function removeJoinedPindanItem(id: number): void {
  const stored = readStored().filter((item) => item.id !== id);
  Taro.setStorageSync(STORAGE_KEY, stored);
}

export function formatJoinedAt(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, `0`);
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
