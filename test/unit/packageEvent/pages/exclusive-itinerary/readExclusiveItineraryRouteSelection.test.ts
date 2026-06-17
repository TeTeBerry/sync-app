import { describe, expect, it, beforeEach } from 'vitest';
import { useNavigationStore } from '@/stores/navigationStore';
import { readExclusiveItineraryRouteSelection } from '@/packageEvent/pages/exclusive-itinerary/readExclusiveItineraryRouteSelection';

describe('readExclusiveItineraryRouteSelection', () => {
  beforeEach(() => {
    useNavigationStore.setState({
      exclusiveItineraryIntent: null,
      activeActivityLegacyId: null,
    });
  });

  it('prefers navigation intent over route params', () => {
    useNavigationStore.getState().setExclusiveItineraryIntent({
      activityLegacyId: 5,
      selectedDjIds: ['carta', 'dennett', 'fifi', 'odd-mob'],
      selectedDjNames: ['CARTA', 'DENNETT', 'FIFI', 'ODD MOB'],
      focusDjName: 'CARTA',
    });

    const selection = readExclusiveItineraryRouteSelection(
      {
        id: '5',
        activityLegacyId: '5',
        selectedDjIds: 'carta',
        selectedDjNames: 'CARTA',
        focusDjName: 'CARTA',
      },
      5,
    );

    expect(selection.selectedDjNames).toEqual(['CARTA', 'DENNETT', 'FIFI', 'ODD MOB']);
    expect(selection.selectedDjIds).toEqual(['carta', 'dennett', 'fifi', 'odd-mob']);
    expect(useNavigationStore.getState().exclusiveItineraryIntent).toBeNull();
  });

  it('falls back to pipe-delimited route params', () => {
    const selection = readExclusiveItineraryRouteSelection(
      {
        id: '5',
        activityLegacyId: '5',
        selectedDjIds: 'carta|dennett|fifi|odd-mob',
        selectedDjNames: 'CARTA|DENNETT|FIFI|ODD MOB',
        focusDjName: 'CARTA',
      },
      5,
    );

    expect(selection.selectedDjNames).toEqual(['CARTA', 'DENNETT', 'FIFI', 'ODD MOB']);
  });
});
