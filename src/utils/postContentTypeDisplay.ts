/** Content-type hashtag labels shown on post cards (e.g. #其他). */
export const CONTENT_TYPE_LABELS: Record<string, string> = {
  team: '组队',
  accommodation: '拼房',
  carpool: '同路',
  ticket: '转票',
  groupbuy: '拼单',
  other: '其他',
};

export const CONTENT_TYPE_STYLE_KEYS = new Set([
  'team',
  'accommodation',
  'carpool',
  'ticket',
  'groupbuy',
  'other',
]);

/** API may return English keys, Chinese labels, or #hashtags. */
const LABEL_TO_TYPE: Record<string, string> = {
  组队: 'team',
  组队队友: 'team',
  找组队: 'team',
  住宿: 'accommodation',
  住宿同行: 'accommodation',
  找拼房: 'accommodation',
  拼房: 'accommodation',
  同路: 'carpool',
  同路同行: 'carpool',
  找同路伙伴: 'carpool',
  拼卡: 'carpool',
  找卡座: 'carpool',
  转票: 'ticket',
  拼单: 'groupbuy',
  出票: 'ticket',
  票务: 'ticket',
  其他: 'other',
  '#组队': 'team',
  '#组队队友': 'team',
  '#住宿': 'accommodation',
  '#住宿同行': 'accommodation',
  '#拼房': 'accommodation',
  '#同路': 'carpool',
  '#同路同行': 'carpool',
  '#拼卡': 'carpool',
  '#转票': 'ticket',
  '#拼单': 'groupbuy',
  '#出票': 'ticket',
  '#其他': 'other',
};

export function resolveContentTypeKey(type: string): string {
  const trimmed = (typeof type === 'string' ? type : String(type ?? '')).trim();
  if (!trimmed) return 'other';
  if (CONTENT_TYPE_STYLE_KEYS.has(trimmed)) return trimmed;

  const fromLabel = LABEL_TO_TYPE[trimmed] ?? LABEL_TO_TYPE[trimmed.replace(/^#/, '')];
  if (fromLabel) return fromLabel;

  const lower = trimmed.toLowerCase();
  if (CONTENT_TYPE_STYLE_KEYS.has(lower)) return lower;

  return trimmed;
}

export function formatContentTypeHashtag(type: string): string {
  const key = resolveContentTypeKey(type);
  const label = CONTENT_TYPE_LABELS[key];
  if (label) return `#${label}`;
  const raw = type.trim();
  return raw.startsWith('#') ? raw : `#${raw.replace(/^#/, '')}`;
}

const CONTENT_TYPE_HASHTAG_RE =
  /#(组队队友|组队|住宿同行|拼房|住宿|同路同行|同路|拼卡|拼单|转票|出票|票务|其他)/g;

function contentTypeKeysFromHashtagText(text: string): string[] {
  const keys = new Set<string>();
  for (const match of text.matchAll(CONTENT_TYPE_HASHTAG_RE)) {
    const key = resolveContentTypeKey(match[1]);
    if (CONTENT_TYPE_STYLE_KEYS.has(key)) keys.add(key);
  }
  return [...keys];
}

/** Merge API contentTypes with hashtags found in body or tags. */
export function mergePostContentTypes(
  types?: string[],
  sources: { body?: string; tags?: string[] } = {},
): string[] {
  const keys = new Set<string>();

  for (const type of types ?? []) {
    if (type == null) continue;
    const key = resolveContentTypeKey(type);
    if (CONTENT_TYPE_STYLE_KEYS.has(key)) keys.add(key);
  }

  for (const key of contentTypeKeysFromHashtagText(sources.body ?? '')) {
    keys.add(key);
  }

  for (const tag of sources.tags ?? []) {
    const key = resolveContentTypeKey(tag);
    if (CONTENT_TYPE_STYLE_KEYS.has(key)) keys.add(key);
  }

  return [...keys];
}

/** Remove content-type hashtags from visible post text (shown as badges instead). */
export function stripContentTypeHashtags(text?: string): string {
  if (!text?.trim()) return '';
  return text
    .replace(CONTENT_TYPE_HASHTAG_RE, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Tags that duplicate a content-type badge (e.g. #其他 when other badge is shown). */
export function filterContentTypeTags(
  tags: string[] | undefined,
  contentTypeKeys: string[],
): string[] {
  const safeTags = tags ?? [];
  if (!safeTags.length || !contentTypeKeys.length) return safeTags;

  const badgeLabels = new Set(
    contentTypeKeys.map((key) => CONTENT_TYPE_LABELS[key]).filter(Boolean),
  );

  return safeTags.filter((tag) => {
    const normalized = tag.trim().replace(/^#/, '');
    const key = resolveContentTypeKey(tag);
    if (CONTENT_TYPE_STYLE_KEYS.has(key)) return false;
    return !badgeLabels.has(normalized);
  });
}
