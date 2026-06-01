import { describe, expect, it } from 'vitest';
import { getCacheData } from '../hooks/useApiQuery';
import {
  seedActivityDetailCache,
  seedActivityDetailFromEventCard,
} from './activityDetailCache';

describe('activityDetailCache', () => {
  it('seeds detail query cache for event-detail first paint', () => {
    seedActivityDetailFromEventCard({
      id: '42',
      title: 'Test Fest',
      date: 'Sat 1/1',
      location: 'Shanghai',
      distance: '',
      image: 'https://example.com/a.jpg',
      attendees: 10,
      category: '',
      hot: true,
      going: false,
    });

    const cached = getCacheData<{ name: string }>(['activities', 'detail', 42]);
    expect(cached?.name).toBe('Test Fest');
  });

  it('merges into existing detail cache', () => {
    seedActivityDetailCache({
      _id: '1',
      legacyId: 7,
      code: '7',
      name: 'Before',
      location: 'A',
    });
    seedActivityDetailCache({
      _id: '1',
      legacyId: 7,
      code: '7',
      name: 'After',
      date: 'Tomorrow',
    });

    const cached = getCacheData<{ name: string; date?: string }>([
      'activities',
      'detail',
      7,
    ]);
    expect(cached?.name).toBe('After');
    expect(cached?.date).toBe('Tomorrow');
  });
});
