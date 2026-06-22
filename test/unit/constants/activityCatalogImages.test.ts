import { describe, expect, it } from 'vitest';
import { resolveCatalogActivityImage } from '@/constants/activityCatalogImages';

describe('activityCatalogImages', () => {
  it('returns API image when provided', () => {
    expect(resolveCatalogActivityImage(5, 'static/activity/edc-thailand.jpg')).toBe(
      'static/activity/edc-thailand.jpg',
    );
  });

  it('returns empty string when image is missing', () => {
    expect(resolveCatalogActivityImage(4, null)).toBe('');
  });
});
