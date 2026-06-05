import { describe, expect, it } from 'vitest';
import { isAiShortcutTag, normalizeAiShortcutTag } from './aiShortcutTags';

describe('aiShortcutTags', () => {
  it('normalizes legacy and alias tags to canonical labels', () => {
    expect(normalizeAiShortcutTag('组队队友')).toBe('找组队');
    expect(normalizeAiShortcutTag('住宿同行')).toBe('找拼房');
    expect(normalizeAiShortcutTag('同路同行')).toBe('找同路伙伴');
    expect(normalizeAiShortcutTag('拼卡')).toBe('找卡座');
    expect(normalizeAiShortcutTag('同路')).toBe('找同路伙伴');
    expect(normalizeAiShortcutTag('帮我dd')).toBe('找组队');
  });

  it('recognizes canonical shortcut tags', () => {
    expect(isAiShortcutTag('找组队')).toBe(true);
    expect(isAiShortcutTag('找卡座')).toBe(true);
    expect(isAiShortcutTag('组队队友')).toBe(true);
  });
});
