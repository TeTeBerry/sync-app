import { describe, expect, it } from 'vitest';
import {
  buildOnsiteBuddyPostForm,
  buildOnsiteIntentPrefillSummaryLines,
} from './onsiteBuddyPostIntents';

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

  it('builds prefill summary lines for sheet banner', () => {
    const form = buildOnsiteBuddyPostForm('onsite_team', '06/13', '深圳', now);
    expect(form).not.toBeNull();
    const lines = buildOnsiteIntentPrefillSummaryLines('onsite_team', form!);
    expect(lines[0]).toBe('现场找队友');
    expect(lines).toContain('深圳');
    expect(lines.some((l) => l.includes('找队友') || l.includes('组队'))).toBe(true);
  });

  it('fills main-stage carpool preset', () => {
    const form = buildOnsiteBuddyPostForm(
      'onsite_carpool_stage',
      '06/13',
      '上海·梅赛德斯奔驰文化中心',
      now,
    );
    expect(form?.tags).toEqual(['carpool', 'team']);
    expect(form?.location).toBe('上海');
    expect(form?.note).toContain('主舞台');
  });
});
