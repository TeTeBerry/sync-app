import { beforeEach, describe, expect, it } from 'vitest';
import { useItineraryStore } from './itineraryStore';

describe('useItineraryStore', () => {
  beforeEach(() => {
    useItineraryStore.setState({ pending: null });
  });

  it('setFromGenerateResult stores pending for the activity', () => {
    useItineraryStore.getState().setFromGenerateResult(4, ['marshmello'], {
      itinerary: {
        eventMeta: '风暴电音节',
        days: [
          { id: 'jun13', label: '6/13', bannerDateLabel: '6/13', nodeCount: 0, items: [] },
        ],
      },
      conflicts: [],
      cached: true,
    });

    const pending = useItineraryStore.getState().pending;
    expect(pending?.activityLegacyId).toBe(4);
    expect(pending?.selectedDjIds).toEqual(['marshmello']);
    expect(pending?.eventMeta).toBe('风暴电音节');
    expect(pending?.cached).toBe(true);
  });

  it('consumePending returns payload once for matching activity', () => {
    useItineraryStore.getState().setPending({
      activityLegacyId: 4,
      selectedDjIds: ['a'],
      eventMeta: 'E',
      days: [],
      conflicts: [],
    });

    const first = useItineraryStore.getState().consumePending(4);
    const second = useItineraryStore.getState().consumePending(4);

    expect(first?.eventMeta).toBe('E');
    expect(second).toBeNull();
    expect(useItineraryStore.getState().pending).toBeNull();
  });

  it('consumePending returns null when activity id mismatches', () => {
    useItineraryStore.getState().setPending({
      activityLegacyId: 4,
      selectedDjIds: [],
      eventMeta: 'E',
      days: [],
      conflicts: [],
    });

    expect(useItineraryStore.getState().consumePending(99)).toBeNull();
    expect(useItineraryStore.getState().pending?.activityLegacyId).toBe(4);
  });
});
