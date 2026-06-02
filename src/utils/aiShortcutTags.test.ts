import { describe, expect, it } from 'vitest';
import { isAiShortcutTag, normalizeAiShortcutTag } from './aiShortcutTags';

describe('aiShortcutTags', () => {
  it('normalizes legacy and alias tags to canonical labels', () => {
    expect(normalizeAiShortcutTag('组队队友')).toBe('找队友');
    expect(normalizeAiShortcutTag('住宿同行')).toBe('找拼房');
    expect(normalizeAiShortcutTag('拼车同行')).toBe('找拼车');
    expect(normalizeAiShortcutTag('拼卡')).toBe('找拼卡');
    expect(normalizeAiShortcutTag('拼车')).toBe('找拼车');
    expect(normalizeAiShortcutTag('帮我dd')).toBe('找队友');
  });

  it('recognizes canonical shortcut tags', () => {
    expect(isAiShortcutTag('找队友')).toBe(true);
    expect(isAiShortcutTag('找拼卡')).toBe(true);
    expect(isAiShortcutTag('组队队友')).toBe(true);
  });
});
