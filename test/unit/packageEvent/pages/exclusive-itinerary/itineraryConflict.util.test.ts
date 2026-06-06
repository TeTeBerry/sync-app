import { describe, expect, it } from 'vitest';
import { EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS } from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryMock';
import { detectItineraryConflicts } from '@/packageEvent/pages/exclusive-itinerary/itineraryConflict.util';

describe('detectItineraryConflicts (mock slots)', () => {
  it('returns no conflicts for default headliners on separate days', () => {
    expect(
      detectItineraryConflicts(EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS, [
        'marshmello',
        'illenium',
      ]),
    ).toHaveLength(0);
  });

  it('detects overlap when jun14 co-headliners are both selected', () => {
    const conflicts = detectItineraryConflicts(
      EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS,
      ['eric-prydz', 'illenium'],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.artistIds).toEqual(['eric-prydz', 'illenium']);
    expect(conflicts[0]?.dateKey).toBe('jun14');
  });
});
