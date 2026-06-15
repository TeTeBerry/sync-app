import { describe, expect, it } from 'vitest';
import {
  categoryFromInteractionType,
  getNotificationCategory,
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

  it('falls back unknown stored categories to general', () => {
    expect(getNotificationCategory({ category: 'like' as never })).toBe('general');
  });
});
