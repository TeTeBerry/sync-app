import { describe, expect, it } from 'vitest';
import { buildUnfollowActivityConfirmOptions } from '@/utils/unfollowActivityConfirm';
import { loadMessages } from '@/i18n/messages';

describe('unfollowActivityConfirm', () => {
  it('builds brand-themed confirm options with event title', async () => {
    await loadMessages('zh-CN');
    const options = buildUnfollowActivityConfirmOptions('风暴电音节 深圳站 2026');

    expect(options.brand).toBe(true);
    expect(options.title).toBe('取消加入风暴电音节 深圳站 2026');
    expect(options.message).toContain('风暴电音节 深圳站 2026');
    expect(options.confirmText).toBe('确认取消');
    expect(options.danger).toBeUndefined();
  });
});
