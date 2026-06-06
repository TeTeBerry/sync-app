import { describe, expect, it } from 'vitest';
import { splitWechatEmojiText } from './wechatEmoji';

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
