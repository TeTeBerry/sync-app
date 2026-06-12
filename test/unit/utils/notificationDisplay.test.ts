import { describe, expect, it } from 'vitest';
import {
  categoryFromInteractionType,
  getNotificationCategory,
  isDeprecatedApplicationNotification,
} from '@/utils/notificationDisplay';

describe('notificationDisplay', () => {
  it('maps interaction types to UI categories', () => {
    expect(categoryFromInteractionType('like')).toBe('like');
    expect(categoryFromInteractionType('application')).toBe('general');
    expect(categoryFromInteractionType('team_accepted')).toBe('general');
    expect(categoryFromInteractionType('post_hidden')).toBe('system');
  });

  it('uses type when present', () => {
    expect(
      getNotificationCategory({
        type: 'like',
        category: 'comment',
      }),
    ).toBe('like');
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
});
