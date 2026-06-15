import { describe, expect, it } from 'vitest';
import {
  buildRegisteredActivityLegacyIds,
  isActivityRegistered,
} from '../../../src/utils/activityRegistration';

describe('buildRegisteredActivityLegacyIds', () => {
  it('merges home going flags with profile activities', () => {
    const ids = buildRegisteredActivityLegacyIds(
      [{ id: '1', going: false } as never, { id: '2', going: true } as never],
      [{ id: '3' } as never, { id: '4' } as never],
    );

    expect([...ids].sort((a, b) => a - b)).toEqual([2, 3, 4]);
  });

  it('dedupes when home and profile share the same legacy id', () => {
    const ids = buildRegisteredActivityLegacyIds(
      [{ id: '42', going: true } as never],
      [{ id: '42' } as never],
    );

    expect([...ids]).toEqual([42]);
  });
});

describe('isActivityRegistered', () => {
  it('returns true when legacy id is in the set', () => {
    expect(isActivityRegistered(7, new Set([7]))).toBe(true);
  });

  it('returns false for null or missing ids', () => {
    expect(isActivityRegistered(null, new Set([7]))).toBe(false);
    expect(isActivityRegistered(8, new Set([7]))).toBe(false);
  });
});
