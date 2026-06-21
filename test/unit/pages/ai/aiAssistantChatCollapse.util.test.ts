import { describe, expect, it } from 'vitest';
import {
  isChatSectionCollapsible,
  resolveDefaultChatExpanded,
} from '@/pages/ai/components/aiAssistantChatCollapse.util';

describe('resolveDefaultChatExpanded', () => {
  it('returns true when activity is unbound', () => {
    expect(resolveDefaultChatExpanded(undefined)).toBe(true);
    expect(resolveDefaultChatExpanded(Number.NaN)).toBe(true);
  });

  it('returns false when activity is bound', () => {
    expect(resolveDefaultChatExpanded(8)).toBe(false);
  });
});

describe('isChatSectionCollapsible', () => {
  it('is collapsible only when activity is bound', () => {
    expect(isChatSectionCollapsible(undefined)).toBe(false);
    expect(isChatSectionCollapsible(8)).toBe(true);
  });
});
