import { describe, expect, it } from 'vitest';
import {
  buildGenreFilterOptions,
  buildStageFilterOptions,
  djMatchesStyleFilter,
  djMatchesStyleSearch,
  extractDjStyleTokens,
  filterGenreOptionsBySearch,
  fuzzyStyleTextMatches,
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

describe('buildGenreFilterOptions', () => {
  it('derives style chips from lineup genreLabel tokens', () => {
    const options = buildGenreFilterOptions(FIXTURE_EXCLUSIVE_DJS);
    expect(options[0]).toEqual({ id: 'all', label: '全部风格' });
    expect(options.map((item) => item.id)).toContain('Future Bass');
    expect(options.map((item) => item.id)).toContain('Bass House');
    expect(options.map((item) => item.id)).not.toContain('House');
    expect(options.map((item) => item.id)).toContain('Dubstep');
  });

  it('sorts styles by artist count descending', () => {
    const edcDjs = [
      { genreLabel: 'Tech House · Bass House' },
      { genreLabel: 'Tech House' },
      { genreLabel: 'Melodic Techno' },
      { genreLabel: 'Tech House · Deep House' },
    ];
    const ids = buildGenreFilterOptions(edcDjs).map((item) => item.id);
    expect(ids[1]).toBe('Tech House');
    expect(ids).toContain('Bass House');
    expect(ids).toContain('Melodic Techno');
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
  it('narrows chips to search hits plus all', () => {
    const options = buildGenreFilterOptions([
      { genreLabel: 'Tech House · Bass House' },
      { genreLabel: 'Melodic Techno' },
      { genreLabel: 'Big Room' },
    ]);
    const filtered = filterGenreOptionsBySearch(options, 'tech');
    expect(filtered.map((item) => item.id)).toEqual([
      'all',
      expect.any(String),
      expect.any(String),
    ]);
    expect(filtered.map((item) => item.id)).toContain('Tech House');
    expect(filtered.map((item) => item.id)).toContain('Melodic Techno');
  });
});

describe('djMatchesStyleFilter', () => {
  it('matches a selected style token exactly', () => {
    const dj = { genreLabel: 'Big Room · Progressive House' };
    expect(djMatchesStyleFilter(dj, 'Big Room')).toBe(true);
    expect(djMatchesStyleFilter(dj, 'Progressive House')).toBe(true);
    expect(djMatchesStyleFilter(dj, 'House')).toBe(false);
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
