/** 与后端 `activity-guide.util` 的出行攻略意图识别保持一致 */

const TRAVEL_GUIDE_INTENT_PATTERNS: RegExp[] = [
  /帮我规划(一下)?行程/,
  /^规划(一下)?行程$/,
  /出行攻略/,
  /行程规划/,
  /(帮我)?(做|生成|出)(一份|个)?(出行|行程)?攻略/,
  /帮我安排(一下)?行程/,
  /帮我规划(一下)?(出行|去程|行程)/,
  /怎么(去|到|前往).{0,12}(会场|现场|音乐节|电音节)/,
];

export function isTravelGuideIntent(input: string): boolean {
  const text = input.trim();
  if (!text) return false;
  if (text.replace(/\s+/g, '') === 'AI攻略') return true;
  return TRAVEL_GUIDE_INTENT_PATTERNS.some((pattern) => pattern.test(text));
}
