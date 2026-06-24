/** Lightweight NL signals — mirrors backend parseEventsActivitySearchQuery heuristics. */
const STRUCTURED_NL_PATTERN =
  /(\d{1,2}\s*月|20\d{2}\s*年|\d{2}\s*年|亚洲|欧洲|国内|海外|港澳台|泰国|日本|韩国|签证|护照|换汇|入境|出境|techno|house|trance|hardstyle|psytrance|找队|组队|招募|搭子|小程序|购票|票务)/i;

const COMPARE_QUERY_PATTERN = /对比|vs|VS|和.*(比|好)|哪个好|选哪/i;

const MONTH_QUERY_PATTERN = /\d{1,2}\s*月/;

const QUESTION_PATTERN = /[？?]|哪些|什么|怎么|如何|推荐|有没有|吗$/;

/**
 * Decide whether to call events_knowledge_search after local keyword filter.
 * Local matches win; AI runs when local is empty or query looks like structured NL.
 */
export function shouldTriggerEventsAiSearch(
  query: string,
  localMatchCount: number,
): boolean {
  const trimmed = query.trim();
  if (!trimmed) {
    return false;
  }
  if (localMatchCount === 0) {
    return true;
  }
  // Month filters need backend date parsing — local keyword hits (e.g. category) are not enough.
  if (MONTH_QUERY_PATTERN.test(trimmed)) {
    return true;
  }
  if (COMPARE_QUERY_PATTERN.test(trimmed)) {
    return true;
  }
  if (trimmed.length >= 8 && STRUCTURED_NL_PATTERN.test(trimmed)) {
    return true;
  }
  if (trimmed.length >= 6 && QUESTION_PATTERN.test(trimmed)) {
    return true;
  }
  return false;
}
