import { describe, expect, it } from 'vitest';
import {
  EDC_THAILAND_2026_IMAGE_URL,
  EDC_THAILAND_2026_LEGACY_ID,
  resolveCatalogActivityImage,
} from '@/constants/activityCatalogImages';

describe('activityCatalogImages', () => {
  it('overrides EDC Thailand hero image from catalog', () => {
    expect(
      resolveCatalogActivityImage(
        EDC_THAILAND_2026_LEGACY_ID,
        'https://old.example/poster.jpg',
      ),
    ).toBe(EDC_THAILAND_2026_IMAGE_URL);
  });

  it('keeps unknown activity image when no catalog override exists', () => {
    expect(resolveCatalogActivityImage(4, 'https://storm.example/poster.jpg')).toBe(
      'https://storm.example/poster.jpg',
    );
  });
});
