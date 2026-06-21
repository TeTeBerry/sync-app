import { describe, expect, it } from 'vitest';
import { travelGuideFormToBuddyPrefill } from '@/utils/travelGuideToBuddyPost';

const mockT = (key: string) =>
  (
    ({
      'travelPlan.budgetEconomy': '经济',
      'travelPlan.budgetEconomyHint': '青旅/民宿',
      'travelPlan.budgetStandard': '标准',
      'travelPlan.budgetStandardHint': '三星',
      'travelPlan.budgetComfort': '舒适',
      'travelPlan.budgetComfortHint': '四星',
      'travelPlan.driveYes': '自驾',
    }) as Record<string, string>
  )[key] ?? key;

describe('travelGuideFormToBuddyPrefill', () => {
  it('maps headcount, activity dates, team tag and note without city prefill', () => {
    const { form, summaryLines } = travelGuideFormToBuddyPrefill(
      {
        departure: '上海',
        headcount: 2,
        budgetTier: 'comfort',
        accommodationNights: 2,
        selfDrive: true,
      },
      '06/13-14/2026',
      mockT,
    );

    expect(form.dateStart).toBe('2026-06-13');
    expect(form.dateEnd).toBe('2026-06-14');
    expect(form.location).toBe('');
    expect(form.headcount).toBe('2');
    expect(form.tags).toEqual(['team']);
    expect(form.note).toContain('住2晚');
    expect(form.note).toContain('自驾');
    expect(summaryLines[0]).toBe('集合点待填写');
    expect(summaryLines[1]).toBe('2人');
  });

  it('keeps meeting point empty when departure city is provided', () => {
    const { form } = travelGuideFormToBuddyPrefill({
      departure: '',
      departureCity: '杭州',
      headcount: 1,
      budgetTier: 'standard',
      accommodationNights: 1,
    });
    expect(form.location).toBe('');
  });

  it('keeps team tag when accommodation nights are zero', () => {
    const { form } = travelGuideFormToBuddyPrefill({
      departure: '北京',
      headcount: 3,
      budgetTier: 'economy',
      accommodationNights: 0,
      selfDrive: false,
    });
    expect(form.tags).toEqual(['team']);
    expect(form.note).not.toMatch(/住\d+晚/);
  });
});
