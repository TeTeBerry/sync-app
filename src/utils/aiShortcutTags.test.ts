import { describe, expect, it } from 'vitest';
import { isAiShortcutTag, normalizeAiShortcutTag } from './aiShortcutTags';

describe('aiShortcutTags', () => {
  it('normalizes 拼车 alias to 拼卡', () => {
    expect(normalizeAiShortcutTag('拼车')).toBe('拼卡');
  });

  it('recognizes 拼卡 as shortcut tag', () => {
    expect(isAiShortcutTag('拼卡')).toBe(true);
  });
});
