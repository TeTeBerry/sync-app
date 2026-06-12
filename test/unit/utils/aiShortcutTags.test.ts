import { describe, expect, it } from 'vitest';
import {
  getTopAiShortcutTags,
  isAiShortcutTag,
  normalizeAiShortcutTag,
} from '@/utils/aiShortcutTags';

describe('aiShortcutTags', () => {
  it('normalizes tags without legacy aliases', () => {
    expect(normalizeAiShortcutTag('  组队  ')).toBe('组队');
    expect(normalizeAiShortcutTag('帮我dd')).toBe('帮我dd');
  });

  it('does not treat any tag as shortcut', () => {
    expect(isAiShortcutTag('组队')).toBe(false);
    expect(isAiShortcutTag('模板发帖')).toBe(false);
  });

  it('returns empty pool when no shortcuts configured', () => {
    expect(getTopAiShortcutTags()).toEqual([]);
  });
});
