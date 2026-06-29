import { describe, expect, it } from 'vitest';
import {
  resolveTravelGuideGenerationPercent,
  resolveTravelGuideGenerationStepIndex,
  resolveTravelGuideGenerationStepLabel,
  travelGuideGenerationStepKey,
  travelGuideTailStepsAfter,
  TRAVEL_GUIDE_GENERATION_STEP_ORDER,
} from '@/domains/travel-guide/utils/travelGuideGenerationProgress.util';

describe('travelGuideGenerationProgress.util', () => {
  it('resolveTravelGuideGenerationPercent clamps values', () => {
    expect(resolveTravelGuideGenerationPercent(null)).toBe(4);
    expect(resolveTravelGuideGenerationPercent({ step: 'map_poi', percent: 28 })).toBe(
      28,
    );
    expect(
      resolveTravelGuideGenerationPercent({ step: 'completed', percent: 100 }),
    ).toBe(100);
  });

  it('resolveTravelGuideGenerationStepIndex maps backend steps', () => {
    expect(
      resolveTravelGuideGenerationStepIndex({ step: 'validating', percent: 8 }),
    ).toBe(0);
    expect(
      resolveTravelGuideGenerationStepIndex({ step: 'quotes_hotels', percent: 36 }),
    ).toBe(2);
    expect(
      resolveTravelGuideGenerationStepIndex({ step: 'quotes_flights', percent: 50 }),
    ).toBe(3);
    expect(
      resolveTravelGuideGenerationStepIndex({ step: 'ai_writing', percent: 66 }),
    ).toBe(4);
    expect(
      resolveTravelGuideGenerationStepIndex({ step: 'completed', percent: 100 }),
    ).toBe(TRAVEL_GUIDE_GENERATION_STEP_ORDER.length);
  });

  it('travelGuideGenerationStepKey returns stable i18n keys', () => {
    expect(travelGuideGenerationStepKey('quotes_hotels')).toBe(
      'travelGuide.genStepQuotesHotels',
    );
    expect(travelGuideGenerationStepKey('quotes_flights')).toBe(
      'travelGuide.genStepQuotesFlights',
    );
  });

  it('resolveTravelGuideGenerationStepLabel falls back to queued', () => {
    const label = resolveTravelGuideGenerationStepLabel(null, (key) => key);
    expect(label).toBe('travelGuide.genStepQueued');
  });

  it('travelGuideTailStepsAfter replays steps after ai_writing', () => {
    expect(
      travelGuideTailStepsAfter({ step: 'ai_writing', percent: 66 }).map((p) => p.step),
    ).toEqual(['assembling', 'finishing', 'completed']);
  });

  it('travelGuideTailStepsAfter only completes when already at finishing', () => {
    expect(
      travelGuideTailStepsAfter({ step: 'finishing', percent: 94 }).map((p) => p.step),
    ).toEqual(['completed']);
  });
});
