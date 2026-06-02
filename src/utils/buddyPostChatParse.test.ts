import { describe, expect, it } from 'vitest';
import {
  buddyPostDraftToForm,
  buildBuddyPostCollectPrompt,
  listMissingBuddyPostSlots,
  mergeBuddyPostDraft,
  buildBuddyPostSuggestedReplies,
  isBuddyPostChatInterrupt,
  parseBuddyPostChatMessage,
  shouldHandleAsBuddyPostChat,
} from './buddyPostChatParse';

describe('buddyPostChatParse', () => {
  it('parses one-shot buddy message', () => {
    const draft = parseBuddyPostChatMessage('6.13-6.14 上海 2人 拼房', '06/13-14/2026');
    expect(draft.dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(draft.dateEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(draft.location).toBe('上海');
    expect(draft.headcount).toBe('2人');
    expect(draft.tags).toContain('accommodation');
    expect(buddyPostDraftToForm(draft)).not.toBeNull();
  });

  it('merges multi-turn draft', () => {
    let draft = parseBuddyPostChatMessage('6.13-6.14', '06/13-14/2026');
    expect(listMissingBuddyPostSlots(draft).length).toBeGreaterThan(0);
    draft = mergeBuddyPostDraft(draft, parseBuddyPostChatMessage('上海 2人'));
    const form = buddyPostDraftToForm(draft);
    expect(form?.location).toBe('上海');
    expect(form?.headcount).toBe('2人');
  });

  it('builds collect prompt', () => {
    const prompt = buildBuddyPostCollectPrompt(['dateRange', 'headcount']);
    expect(prompt).toContain('时间');
    expect(prompt).toContain('组队发帖');
  });
});

describe('buddyPostChatParse routing', () => {
  it('shouldHandleAsBuddyPostChat for one-shot and collecting', () => {
    expect(
      shouldHandleAsBuddyPostChat({
        text: '6.13-6.14 上海 2人 拼房',
        collecting: false,
        activityDate: '06/13-14/2026',
      }),
    ).toBe(true);
    expect(
      shouldHandleAsBuddyPostChat({
        text: '上海',
        collecting: true,
        activityDate: '06/13-14/2026',
      }),
    ).toBe(true);
    expect(
      shouldHandleAsBuddyPostChat({
        text: '组队发帖',
        collecting: false,
      }),
    ).toBe(true);
  });

  it('does not steal travel-guide phrases', () => {
    expect(
      shouldHandleAsBuddyPostChat({
        text: '上海2人舒适自驾住2晚',
        collecting: false,
      }),
    ).toBe(false);
  });

  it('isBuddyPostChatInterrupt exits collect for guide intents', () => {
    expect(isBuddyPostChatInterrupt('帮我规划行程')).toBe(true);
    expect(isBuddyPostChatInterrupt('6.13 上海 2人')).toBe(false);
  });

  it('buildBuddyPostSuggestedReplies for single missing slot', () => {
    expect(buildBuddyPostSuggestedReplies(['headcount'])).toContain('2人');
  });
});
