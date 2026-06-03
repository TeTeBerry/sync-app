import { describe, expect, it } from 'vitest';
import {
  categoryFromInteractionType,
  getNotificationCategory,
} from './notificationDisplay';

describe('notificationDisplay', () => {
  it('maps interaction types to UI categories', () => {
    expect(categoryFromInteractionType('like')).toBe('like');
    expect(categoryFromInteractionType('application')).toBe('application');
    expect(categoryFromInteractionType('team_accepted')).toBe('application');
    expect(categoryFromInteractionType('post_hidden')).toBe('system');
  });

  it('prefers type over legacy mismatched category', () => {
    expect(
      getNotificationCategory({
        type: 'application',
        category: 'comment',
      }),
    ).toBe('application');
  });

  it('uses stored category when type is absent', () => {
    expect(getNotificationCategory({ category: 'system' })).toBe('system');
  });
});
