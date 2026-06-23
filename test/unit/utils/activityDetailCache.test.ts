import { describe, expect, it, vi } from 'vitest';
import { getCacheData, onCacheDataUpdated } from '@/hooks/useApiQuery';
import { invalidateActivities } from '@/utils/queryInvalidation';
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

  it('invalidateActivities clears prefetch seed for detail queries', () => {
    seedActivityDetailFromEventCard({
      id: '55',
      title: 'Invalidate Fest',
      date: 'Sat 1/1',
      location: 'Shanghai',
      distance: '',
      image: '',
      attendees: 0,
      category: '',
      hot: false,
      going: false,
    });
    expect(getCacheData(['activities', 'detail', 55])).toBeDefined();

    invalidateActivities();
    expect(getCacheData(['activities', 'detail', 55])).toBeUndefined();
  });

  it('broadcasts cache updates when seeding detail cache', () => {
    const listener = vi.fn();
    const unsubscribe = onCacheDataUpdated('activities|detail|88', listener);

    seedActivityDetailCache({
      _id: '88',
      legacyId: 88,
      code: '88',
      name: 'Broadcast Fest',
    });

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
