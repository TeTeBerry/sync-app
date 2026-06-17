import { describe, expect, it } from 'vitest';
import {
  itineraryDjCardDomId,
  resolveItineraryDjSelection,
} from '@/domains/performance-itinerary/utils/resolveItineraryDjSelection';

const CATALOG = [
  { id: 'carta', name: 'CARTA' },
  { id: 'martin-garrix', name: 'MARTIN GARRIX' },
];

describe('resolveItineraryDjSelection', () => {
  it('resolves focus dj by lineup name when requested id differs', () => {
    const result = resolveItineraryDjSelection({
      requestedIds: ['wrong-id'],
      focusDjName: 'CARTA',
      catalog: CATALOG,
    });

    expect(result.selectedIds).toEqual(['carta']);
    expect(result.focusDjId).toBe('carta');
  });

  it('keeps requested ids that already exist in catalog', () => {
    const result = resolveItineraryDjSelection({
      requestedIds: ['carta'],
      focusDjName: 'CARTA',
      catalog: CATALOG,
    });

    expect(result.selectedIds).toEqual(['carta']);
    expect(result.focusDjId).toBe('carta');
  });

  it('builds stable scroll target ids for dj cards', () => {
    expect(itineraryDjCardDomId('carta')).toBe('dj-card-carta');
  });
});
