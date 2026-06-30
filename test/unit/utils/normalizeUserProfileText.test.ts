import { describe, expect, it } from 'vitest';
import {
  normalizeAiGuidePlanFormValues,
  normalizeCurrentUserProfile,
  normalizeUserCity,
} from '@/utils/normalizeUserProfileText';

describe('normalizeUserProfileText', () => {
  it('decodes percent-encoded user city', () => {
    expect(normalizeUserCity('%E4%B8%8A%E6%B5%B7')).toBe('上海');
  });

  it('normalizes current user profile city', () => {
    expect(
      normalizeCurrentUserProfile({
        id: 'u1',
        city: '%E4%B8%8A%E6%B5%B7',
      }).city,
    ).toBe('上海');
  });

  it('normalizes travel guide form departure fields', () => {
    expect(
      normalizeAiGuidePlanFormValues({
        departure: '%E6%85%A7%E6%99%BA%C2%B7%E4%BB%81%E6%81%92',
        headcount: 1,
        accommodationNights: 0,
        selfDrive: true,
      }),
    ).toEqual({
      departure: '慧智·仁恒',
      headcount: 1,
      accommodationNights: 0,
      selfDrive: true,
    });
  });
});
