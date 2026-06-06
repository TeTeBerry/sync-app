/** Official WeChat emoji sprite CDN (wx_fed we-emoji). */
export const WECHAT_EMOJI_CDN_BASE =
  'https://res.wx.qq.com/t/wx_fed/we-emoji/res/v1.3.0/assets/Expression';

export type WechatEmojiItem = {
  /** Bracket label inserted into text, e.g. `[微笑]`. */
  label: string;
  file: string;
};

const WECHAT_EMOJI_NAMES = [
  '微笑',
  '撇嘴',
  '色',
  '发呆',
  '得意',
  '流泪',
  '害羞',
  '闭嘴',
  '睡',
  '大哭',
  '尴尬',
  '发怒',
  '调皮',
  '呲牙',
  '惊讶',
  '难过',
  '酷',
  '冷汗',
  '抓狂',
  '吐',
  '偷笑',
  '可爱',
  '白眼',
  '傲慢',
  '饥饿',
  '困',
  '惊恐',
  '流汗',
  '憨笑',
  '大兵',
  '奋斗',
  '咒骂',
  '疑问',
  '嘘',
  '晕',
  '折磨',
  '衰',
  '骷髅',
  '敲打',
  '再见',
  '擦汗',
  '抠鼻',
  '鼓掌',
  '糗大了',
  '坏笑',
  '左哼哼',
  '右哼哼',
  '哈欠',
] as const;

export const WECHAT_EMOJI_LIST: WechatEmojiItem[] = WECHAT_EMOJI_NAMES.map(
  (name, index) => ({
    label: `[${name}]`,
    file: `Expression_${index + 1}@2x.png`,
  }),
);

const LABEL_TO_FILE = new Map(WECHAT_EMOJI_LIST.map((item) => [item.label, item.file]));

export function wechatEmojiImageUrl(file: string): string {
  return `${WECHAT_EMOJI_CDN_BASE}/${file}`;
}

export function wechatEmojiFileForLabel(label: string): string | undefined {
  return LABEL_TO_FILE.get(label);
}

export type WechatEmojiTextPart =
  | { type: 'text'; value: string }
  | { type: 'emoji'; label: string; file: string };

const WECHAT_EMOJI_LABEL_RE = /\[([^\]]+)\]/g;

/** Split plain text into runs of text and known WeChat emoji labels. */
export function splitWechatEmojiText(text: string): WechatEmojiTextPart[] {
  if (!text) return [];

  const parts: WechatEmojiTextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(WECHAT_EMOJI_LABEL_RE)) {
    const label = match[0];
    const index = match.index ?? 0;
    const file = wechatEmojiFileForLabel(label);

    if (!file) continue;

    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    parts.push({ type: 'emoji', label, file });
    lastIndex = index + label.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
}
