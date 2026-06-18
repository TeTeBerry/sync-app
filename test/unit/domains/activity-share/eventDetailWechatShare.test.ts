import { describe, expect, it } from 'vitest';
import {
  buildEventDetailShareImageUrl,
  buildEventDetailSharePath,
  buildEventDetailShareTitle,
} from '@/domains/activity-share/utils/eventDetailWechatShare.util';

describe('eventDetailWechatShare', () => {
  it('builds share title from activity fields', () => {
    expect(
      buildEventDetailShareTitle({
        name: 'EDC Thailand 2026',
        date: '2026-12-18',
        location: 'Pattaya',
      }),
    ).toBe('EDC Thailand 2026 · 2026-12-18 · Pattaya');
  });

  it('builds share path with id and activityLegacyId', () => {
    const path = buildEventDetailSharePath(42);
    expect(path).toContain('id=42');
    expect(path).toContain('activityLegacyId=42');
  });

  it('filters non-https share images', () => {
    expect(
      buildEventDetailShareImageUrl(42, 'cloud://bucket/image.jpg'),
    ).toBeUndefined();
    expect(buildEventDetailShareImageUrl(42, 'https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });
});
