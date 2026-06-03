import { describe, expect, it } from 'vitest';
import { buildLightApplyMessage, formatLightApplyBody } from './lightApplyDraft';

describe('lightApplyDraft', () => {
  it('formats body and message with note', () => {
    const draft = {
      departureCity: '广州',
      tripDays: 2,
      genderPref: '女生优先' as const,
    };
    expect(formatLightApplyBody(draft)).toBe('从广州出发，活动 2 天，女生优先');
    expect(buildLightApplyMessage(draft, '可以拼房')).toContain('补充：可以拼房');
  });
});
