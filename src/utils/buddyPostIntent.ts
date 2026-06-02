/** 与后端 activity-guide 区分：明确「发组队帖」意图 */

const BUDDY_POST_INTENT_PATTERNS: RegExp[] = [
  /^组队发帖$/,
  /^发布组队$/,
  /^发组队帖$/,
  /^AI组队$/,
  /^我要组队$/,
  /^发个?组队帖$/,
  /帮我(发|发布).{0,6}组队帖/,
];

export function isBuddyPostIntent(input: string): boolean {
  const text = input.trim();
  if (!text) return false;
  if (text.replace(/\s+/g, '') === '组队发帖') return true;
  return BUDDY_POST_INTENT_PATTERNS.some((pattern) => pattern.test(text));
}
