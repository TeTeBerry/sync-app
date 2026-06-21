import { describe, expect, it } from 'vitest';
import {
  buildGenreFilterOptions,
  buildStageFilterOptions,
  djMatchesStyleFilter,
  djMatchesStyleSearch,
  extractDjStyleTokens,
  filterGenreOptionsBySearch,
  fuzzyStyleTextMatches,
  resolvePrimaryGenreCategory,
} from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import { FIXTURE_EXCLUSIVE_DJS } from '../../../../fixtures/itineraryUi.fixture';

describe('extractDjStyleTokens', () => {
  it('splits Discogs style labels', () => {
    expect(extractDjStyleTokens('Tech House · Bass House')).toEqual([
      'Tech House',
      'Bass House',
    ]);
  });
});

describe('resolvePrimaryGenreCategory', () => {
  it('keeps canonical primary genres', () => {
    expect(resolvePrimaryGenreCategory('House')).toBe('House');
    expect(resolvePrimaryGenreCategory('Techno')).toBe('Techno');
    expect(resolvePrimaryGenreCategory('Drum & Bass')).toBe('Drum & Bass');
  });

  it('collapses sub-genres into primary buckets', () => {
    expect(resolvePrimaryGenreCategory('Big Room')).toBe('House');
    expect(resolvePrimaryGenreCategory('Bass House')).toBe('House');
    expect(resolvePrimaryGenreCategory('Future Bass')).toBe('Bass');
    expect(resolvePrimaryGenreCategory('Melodic Techno')).toBe('Techno');
  });
});

describe('buildGenreFilterOptions', () => {
  it('derives primary category chips from lineup genre field', () => {
    const options = buildGenreFilterOptions(FIXTURE_EXCLUSIVE_DJS);
    expect(options[0]).toEqual({ id: 'all', label: '全部风格' });
    expect(options.map((item) => item.id)).toEqual(['all', 'Bass', 'Dubstep', 'House']);
    expect(options.map((item) => item.id)).not.toContain('Tech House');
    expect(options.map((item) => item.id)).not.toContain('Brostep');
  });

  it('aggregates sub-genre artists into primary categories', () => {
    const options = buildGenreFilterOptions([
      { genre: 'Big Room' },
      { genre: 'Bass House' },
      { genre: 'House' },
      { genre: 'Techno' },
    ]);
    expect(options.map((item) => item.id)).toEqual(['all', 'House', 'Techno']);
  });

  it('sorts categories by artist count descending', () => {
    const edcDjs = [
      { genre: 'House' },
      { genre: 'House' },
      { genre: 'House' },
      { genre: 'Techno' },
      { genre: 'Techno' },
      { genre: 'Trance' },
    ];
    const ids = buildGenreFilterOptions(edcDjs).map((item) => item.id);
    expect(ids[1]).toBe('House');
    expect(ids).toEqual(['all', 'House', 'Techno', 'Trance']);
  });
});

describe('fuzzy style search', () => {
  it('matches substring and word prefix', () => {
    expect(fuzzyStyleTextMatches('Progressive House', 'prog')).toBe(true);
    expect(fuzzyStyleTextMatches('Tech House', 'tech')).toBe(true);
    expect(fuzzyStyleTextMatches('Big Room', 'room')).toBe(true);
    expect(fuzzyStyleTextMatches('Techno', 'house')).toBe(false);
  });

  it('supports common aliases', () => {
    expect(fuzzyStyleTextMatches('Drum n Bass', 'dnb')).toBe(true);
  });
});

describe('djMatchesStyleSearch', () => {
  it('matches any style token in genreLabel', () => {
    const dj = { genreLabel: 'Big Room · Progressive House' };
    expect(djMatchesStyleSearch(dj, 'prog')).toBe(true);
    expect(djMatchesStyleSearch(dj, 'big')).toBe(true);
    expect(djMatchesStyleSearch(dj, 'trap')).toBe(false);
  });

  it('returns all when query empty', () => {
    expect(djMatchesStyleSearch({ genreLabel: 'Techno' }, '')).toBe(true);
  });
});

describe('filterGenreOptionsBySearch', () => {
  it('narrows primary category chips to search hits plus all', () => {
    const options = buildGenreFilterOptions([
      { genre: 'House' },
      { genre: 'Techno' },
      { genre: 'Big Room' },
    ]);
    const filtered = filterGenreOptionsBySearch(options, 'tech');
    expect(filtered.map((item) => item.id)).toEqual(['all', 'Techno']);
  });
});

describe('djMatchesStyleFilter', () => {
  it('matches a selected primary genre category', () => {
    const dj = {
      genre: 'Big Room',
      genreLabel: 'Big Room · Progressive House',
    };
    expect(djMatchesStyleFilter(dj, 'House')).toBe(true);
    expect(djMatchesStyleFilter(dj, 'Big Room')).toBe(true);
    expect(djMatchesStyleFilter(dj, 'Techno')).toBe(false);
    expect(djMatchesStyleFilter(dj, 'all')).toBe(true);
  });
});

describe('buildStageFilterOptions', () => {
  it('includes only stages present in the roster', () => {
    const options = buildStageFilterOptions(FIXTURE_EXCLUSIVE_DJS);
    expect(options).toEqual([
      { id: 'all', label: '全部舞台' },
      { id: 'main', label: '主舞台' },
    ]);
  });
});
