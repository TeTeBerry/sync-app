import { describe, expect, it } from 'vitest';
import {
  splitWechatEmojiText,
  wechatEmojiImageUrl,
  WECHAT_EMOJI_CDN_BASE,
} from '@/constants/wechatEmoji';

describe('splitWechatEmojiText', () => {
  it('splits known WeChat emoji labels', () => {
    expect(splitWechatEmojiText('现场绝了[微笑]太顶了')).toEqual([
      { type: 'text', value: '现场绝了' },
      { type: 'emoji', label: '[微笑]', file: 'Expression_1@2x.png' },
      { type: 'text', value: '太顶了' },
    ]);
  });

  it('ignores unknown bracket labels', () => {
    expect(splitWechatEmojiText('[未知标签] ok')).toEqual([
      { type: 'text', value: '[未知标签] ok' },
    ]);
  });
});

describe('wechatEmojiImageUrl', () => {
  it('uses the wx_fed we-emoji res CDN path', () => {
    expect(WECHAT_EMOJI_CDN_BASE).toContain('/we-emoji/res/');
    expect(wechatEmojiImageUrl('Expression_1@2x.png')).toBe(
      `${WECHAT_EMOJI_CDN_BASE}/Expression_1@2x.png`,
    );
  });
});
