import { describe, expect, it } from 'vitest';
import { buildSelectedActivityLegacyIds } from '../../../src/utils/activitySelection';

describe('buildSelectedActivityLegacyIds', () => {
  it('uses profile activities as source of truth when loaded', () => {
    const ids = buildSelectedActivityLegacyIds(
      [{ id: '1', going: false } as never, { id: '2', going: true } as never],
      [{ activityLegacyId: '3' } as never, { activityLegacyId: '4' } as never],
    );

    expect([...ids].sort((a, b) => a - b)).toEqual([3, 4]);
  });

  it('returns empty set when profile activities loaded empty', () => {
    const ids = buildSelectedActivityLegacyIds([{ id: '2', going: true } as never], []);

    expect([...ids]).toEqual([]);
  });

  it('falls back to home going flags while profile list is loading', () => {
    const ids = buildSelectedActivityLegacyIds(
      [{ id: '1', going: false } as never, { id: '2', going: true } as never],
      undefined,
    );

    expect([...ids]).toEqual([2]);
  });

  it('dedupes when home and profile share the same legacy id', () => {
    const ids = buildSelectedActivityLegacyIds(
      [{ id: '42', going: true } as never],
      [{ activityLegacyId: '42' } as never],
    );

    expect([...ids]).toEqual([42]);
  });
});
