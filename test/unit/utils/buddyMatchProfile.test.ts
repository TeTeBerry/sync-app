import { describe, expect, it } from 'vitest';
import { hasGenrePreferences, toBuddyMatchProfile } from '@/utils/buddyMatchProfile';
import { useBuddyMatchProfileStore } from '@/stores/buddyMatchProfileStore';

describe('hasGenrePreferences', () => {
  it('is false when profile has no genres', () => {
    expect(hasGenrePreferences(null)).toBe(false);
    expect(hasGenrePreferences({ city: '上海' })).toBe(false);
    expect(hasGenrePreferences({ favorGenres: [] })).toBe(false);
  });

  it('is true when profile has genres', () => {
    expect(hasGenrePreferences({ favorGenres: ['Techno'] })).toBe(true);
  });
});

describe('toBuddyMatchProfile', () => {
  it('returns null when user has no preference fields', () => {
    expect(toBuddyMatchProfile({})).toBeNull();
    expect(
      toBuddyMatchProfile({ city: '', favorGenres: [], budgetLevel: '' }),
    ).toBeNull();
  });

  it('keeps genres only when city and budget are empty', () => {
    expect(toBuddyMatchProfile({ favorGenres: ['House'] })).toEqual({
      favorGenres: ['House'],
    });
  });
});

describe('useBuddyMatchProfileStore', () => {
  it('marks hydrated after syncing from current user', () => {
    useBuddyMatchProfileStore.getState().clear();
    expect(useBuddyMatchProfileStore.getState().hydrated).toBe(false);

    useBuddyMatchProfileStore.getState().setFromCurrentUser({
      id: 'u1',
      name: 'Test',
      handle: '@test',
      favorGenres: ['Techno'],
    });

    const state = useBuddyMatchProfileStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.profile).toEqual({ favorGenres: ['Techno'] });
  });

  it('clears profile and hydration on logout clear', () => {
    useBuddyMatchProfileStore.getState().setFromCurrentUser({
      id: 'u1',
      name: 'Test',
      handle: '@test',
      favorGenres: ['Techno'],
    });
    useBuddyMatchProfileStore.getState().clear();
    const state = useBuddyMatchProfileStore.getState();
    expect(state.hydrated).toBe(false);
    expect(state.profile).toBeNull();
  });
});
