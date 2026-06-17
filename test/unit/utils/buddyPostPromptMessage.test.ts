import { describe, expect, it } from 'vitest';
import {
  BUDDY_POST_SHEET_ACTION_LABEL,
  filterBuddyPostSheetShortcutReplies,
  isBuddyPostTemplatePrompt,
  REQUIRE_BUDDY_POST_MARKER,
  SELF_POST_COLLECT_BODY_MARKER,
} from '@/utils/buddyPostPromptMessage';

describe('buddyPostPromptMessage', () => {
  it('detects buddy post template prompts', () => {
    expect(
      isBuddyPostTemplatePrompt(`${SELF_POST_COLLECT_BODY_MARKER}\n请补充组队信息`),
    ).toBe(true);
    expect(isBuddyPostTemplatePrompt(`${REQUIRE_BUDDY_POST_MARKER}\n请先填写`)).toBe(
      true,
    );
    expect(isBuddyPostTemplatePrompt('想聊聊阵容')).toBe(false);
  });

  it('filters sheet shortcut from suggested replies', () => {
    expect(
      filterBuddyPostSheetShortcutReplies([
        '6.13-6.14 上海 2人 拼房',
        BUDDY_POST_SHEET_ACTION_LABEL,
      ]),
    ).toEqual(['6.13-6.14 上海 2人 拼房']);
  });
});
