import { describe, expect, it } from 'vitest';
import { isAiShortcutTag, normalizeAiShortcutTag } from '@/utils/aiShortcutTags';

describe('aiShortcutTags', () => {
  it('normalizes legacy and alias tags to canonical labels', () => {
    expect(normalizeAiShortcutTag('组队队友')).toBe('找组队');
    expect(normalizeAiShortcutTag('找队友')).toBe('找组队');
    expect(normalizeAiShortcutTag('住宿同行')).toBe('找拼房');
    expect(normalizeAiShortcutTag('拼卡')).toBe('找卡座');
    expect(normalizeAiShortcutTag('找拼卡')).toBe('找卡座');
    expect(normalizeAiShortcutTag('帮我dd')).toBe('找组队');
  });

  it('recognizes canonical shortcut tags', () => {
    expect(isAiShortcutTag('找组队')).toBe(true);
    expect(isAiShortcutTag('找卡座')).toBe(true);
    expect(isAiShortcutTag('组队队友')).toBe(true);
    expect(isAiShortcutTag('找同路伙伴')).toBe(false);
    expect(isAiShortcutTag('找拼车')).toBe(false);
  });
});
