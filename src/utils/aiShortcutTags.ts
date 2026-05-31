import Taro from "@tarojs/taro";

const STORAGE_KEY = "sync_ai_shortcut_tag_usage";
const DISPLAY_COUNT = 6;

/** 可选快捷标签池（含默认展示项） */
export const AI_SHORTCUT_TAG_POOL = ["组队队友", "住宿同行", "拼车同行"] as const;

export type AiShortcutTag = (typeof AI_SHORTCUT_TAG_POOL)[number];

type UsageMap = Record<string, number>;

/** 展示文案别名 → 标准快捷标签 */
export const AI_SHORTCUT_TAG_ALIASES: Record<string, AiShortcutTag> = {
  帮我dd: "组队队友",
};

const LEGACY_TAG_ALIASES: Record<string, string> = {
  拼房同行: "住宿同行",
};

export function normalizeAiShortcutTag(tag: string): string {
  const trimmed = tag.trim();
  return AI_SHORTCUT_TAG_ALIASES[trimmed] ?? LEGACY_TAG_ALIASES[trimmed] ?? trimmed;
}

function readUsage(): UsageMap {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (!raw || typeof raw !== "object") return {};
    const usage = raw as UsageMap;
    const migrated: UsageMap = {};
    for (const [key, count] of Object.entries(usage)) {
      const nextKey = LEGACY_TAG_ALIASES[key] ?? key;
      migrated[nextKey] = (migrated[nextKey] ?? 0) + count;
    }
    return migrated;
  } catch {
    return {};
  }
}

function writeUsage(usage: UsageMap): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, usage);
  } catch {
    // ignore quota / private mode
  }
}

export function isAiShortcutTag(tag: string): boolean {
  const canonical = normalizeAiShortcutTag(tag);
  if (!canonical) return false;
  if (AI_SHORTCUT_TAG_POOL.includes(canonical as AiShortcutTag)) return true;
  return canonical in readUsage();
}

/** 记录一次快捷标签使用 */
export function recordAiShortcutTagUse(tag: string): void {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const usage = readUsage();
  usage[trimmed] = (usage[trimmed] ?? 0) + 1;
  writeUsage(usage);
}

/** 按使用次数取前 N 个标签；无使用记录时返回默认顺序 */
export function getTopAiShortcutTags(limit = DISPLAY_COUNT): string[] {
  const usage = readUsage();
  const pool = [...AI_SHORTCUT_TAG_POOL];
  const extras = Object.keys(usage).filter((k) => !pool.includes(k as AiShortcutTag));
  const candidates = [...pool, ...extras];

  const sorted = [...candidates].sort((a, b) => {
    const diff = (usage[b] ?? 0) - (usage[a] ?? 0);
    if (diff !== 0) return diff;
    const ai = pool.indexOf(a as AiShortcutTag);
    const bi = pool.indexOf(b as AiShortcutTag);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const hasUsage = sorted.some((tag) => (usage[tag] ?? 0) > 0);
  if (!hasUsage) {
    return pool.slice(0, limit);
  }

  const picked: string[] = [];
  for (const tag of sorted) {
    if ((usage[tag] ?? 0) <= 0) continue;
    if (picked.includes(tag)) continue;
    picked.push(tag);
    if (picked.length >= limit) break;
  }

  for (const tag of pool) {
    if (picked.length >= limit) break;
    if (!picked.includes(tag)) picked.push(tag);
  }

  return picked.slice(0, limit);
}
