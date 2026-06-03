import { describe, expect, it } from 'vitest';
import { buildOnsiteBuddyPostForm } from './onsiteBuddyPostIntents';

describe('buildOnsiteBuddyPostForm', () => {
  const now = new Date(2026, 5, 13, 15, 0, 0, 0);

  it('fills onsite team preset with city and today date', () => {
    const form = buildOnsiteBuddyPostForm(
      'onsite_team',
      '06/13-14',
      '深圳·大运中心',
      now,
    );
    expect(form).not.toBeNull();
    expect(form?.location).toBe('深圳');
    expect(form?.dateStart).toBe('2026-06-13');
    expect(form?.tags).toEqual(['team']);
    expect(form?.note).toContain('现场');
  });

  it('fills carpool preset with carpool and team tags', () => {
    const form = buildOnsiteBuddyPostForm('onsite_carpool', '06/13', undefined, now);
    expect(form?.tags).toEqual(['carpool', 'team']);
    expect(form?.note).toContain('散场');
  });
});
