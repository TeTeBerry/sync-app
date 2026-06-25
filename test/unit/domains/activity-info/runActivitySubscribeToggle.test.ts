import { describe, expect, it, vi } from 'vitest';
import { runActivitySubscribeToggle } from '@/domains/activity-info/utils/runActivitySubscribeToggle';

describe('runActivitySubscribeToggle', () => {
  it('subscribes when not followed', async () => {
    const subscribe = vi.fn().mockResolvedValue('wechat_accepted');
    const unsubscribe = vi.fn();

    await expect(
      runActivitySubscribeToggle(
        { activityLegacyId: 8, followed: false, toggleable: true },
        { subscribe, unsubscribe },
      ),
    ).resolves.toEqual({ kind: 'subscribed' });

    expect(subscribe).toHaveBeenCalledWith(8);
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('blocks unfollow when toggleable is false', async () => {
    const subscribe = vi.fn();
    const unsubscribe = vi.fn();

    await expect(
      runActivitySubscribeToggle(
        { activityLegacyId: 8, followed: true, toggleable: false },
        { subscribe, unsubscribe },
      ),
    ).resolves.toEqual({ kind: 'noop' });

    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('skips unfollow when confirmation is rejected', async () => {
    const subscribe = vi.fn();
    const unsubscribe = vi.fn();
    const confirmUnfollow = vi.fn().mockResolvedValue(false);

    await expect(
      runActivitySubscribeToggle(
        {
          activityLegacyId: 8,
          followed: true,
          toggleable: true,
          confirmUnfollow,
        },
        { subscribe, unsubscribe },
      ),
    ).resolves.toEqual({ kind: 'noop' });

    expect(confirmUnfollow).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('unsubscribes after confirmation', async () => {
    const subscribe = vi.fn();
    const unsubscribe = vi.fn().mockResolvedValue('success');
    const confirmUnfollow = vi.fn().mockResolvedValue(true);

    await expect(
      runActivitySubscribeToggle(
        {
          activityLegacyId: 8,
          followed: true,
          toggleable: true,
          confirmUnfollow,
        },
        { subscribe, unsubscribe },
      ),
    ).resolves.toEqual({ kind: 'unsubscribed' });

    expect(unsubscribe).toHaveBeenCalledWith(8);
  });
});
