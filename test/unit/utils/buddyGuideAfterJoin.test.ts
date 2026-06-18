import { describe, expect, it, vi } from 'vitest';
import { promptBuddyGuideAfterJoin } from '@/utils/buddyGuideAfterJoin';

describe('buddyGuideAfterJoin', () => {
  it('prompts with buddy-post copy', async () => {
    const confirm = vi.fn().mockResolvedValue(true);
    const result = await promptBuddyGuideAfterJoin(confirm);

    expect(result).toBe(true);
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '报名成功',
        confirmText: '去看结伴帖',
        cancelText: '稍后再说',
      }),
    );
  });
});
