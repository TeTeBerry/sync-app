import { describe, expect, it } from 'vitest';
import { getCacheData } from '@/hooks/useApiQuery';
import {
  seedActivityDetailCache,
  seedActivityDetailFromEventCard,
  seedActivityDetailFromFeaturedEvent,
  seedActivityDetailFromHomeSignupEvent,
} from '@/utils/activityDetailCache';

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

  it('seeds detail cache from home featured event', () => {
    seedActivityDetailFromFeaturedEvent({
      id: 9,
      legacyId: 9,
      title: 'Home Fest',
      date: '06/01',
      venue: 'Shanghai',
      distance: '',
      category: 'EDM节',
      isHot: true,
      attendeeCount: '10+',
      remaining: '',
      guests: [],
      going: false,
    });

    const cached = getCacheData<{ name: string; location?: string }>([
      'activities',
      'detail',
      9,
    ]);
    expect(cached?.name).toBe('Home Fest');
    expect(cached?.location).toBe('Shanghai');
  });

  it('seeds detail cache from home signup event', () => {
    seedActivityDetailFromHomeSignupEvent({
      id: 12,
      title: 'Signup Fest',
      date: '07/01',
      location: 'Beijing',
      image: '',
      category: 'EDM节',
      hot: false,
      attendees: 5,
      going: false,
    });

    const cached = getCacheData<{ name: string }>(['activities', 'detail', 12]);
    expect(cached?.name).toBe('Signup Fest');
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
