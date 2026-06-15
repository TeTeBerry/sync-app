import { describe, expect, it } from 'vitest';
import {
  categoryFromInteractionType,
  getNotificationCategory,
  isDeprecatedApplicationNotification,
  isHiddenNotification,
} from '@/utils/notificationDisplay';

describe('notificationDisplay', () => {
  it('maps interaction types to UI categories', () => {
    expect(categoryFromInteractionType('like')).toBe('general');
    expect(categoryFromInteractionType('application')).toBe('general');
    expect(categoryFromInteractionType('team_accepted')).toBe('general');
    expect(categoryFromInteractionType('post_hidden')).toBe('system');
  });

  it('uses type when present', () => {
    expect(
      getNotificationCategory({
        type: 'post_hidden',
        category: 'system',
      }),
    ).toBe('system');
  });

  it('uses stored category when type is absent', () => {
    expect(getNotificationCategory({ category: 'system' })).toBe('system');
  });

  it('flags legacy team application notifications', () => {
    expect(
      isDeprecatedApplicationNotification({
        type: 'application',
        category: 'application',
      }),
    ).toBe(true);
    expect(isDeprecatedApplicationNotification({ type: 'like' })).toBe(false);
  });

  it('hides like and comment notifications', () => {
    expect(isHiddenNotification({ type: 'like' })).toBe(true);
    expect(isHiddenNotification({ type: 'comment' })).toBe(true);
    expect(
      isHiddenNotification({
        type: 'activity_update',
        category: 'system',
      }),
    ).toBe(false);
  });
});
