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

  it('detects overlap when same-day slots intersect', () => {
    const conflicts = detectItineraryConflicts(
      [
        {
          artistId: 'eric-prydz',
          artistName: 'ERIC PRYDZ',
          dateKey: 'jun14',
          startMinutes: 18 * 60 + 55,
          endMinutes: 20 * 60 + 30,
          startTime: '18:55',
          endTime: '20:30',
          stageLabel: '主舞台',
        },
        {
          artistId: 'illenium',
          artistName: 'ILLENIUM',
          dateKey: 'jun14',
          startMinutes: 20 * 60 + 15,
          endMinutes: 22 * 60,
          startTime: '20:15',
          endTime: '22:00',
          stageLabel: '主舞台',
        },
      ],
      ['eric-prydz', 'illenium'],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.artistIds).toEqual(['eric-prydz', 'illenium']);
    expect(conflicts[0]?.dateKey).toBe('jun14');
  });

  it('official jun14 headliner slots do not overlap', () => {
    expect(
      detectItineraryConflicts(EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS, [
        'eric-prydz',
        'illenium',
      ]),
    ).toHaveLength(0);
  });
});
