import { describe, expect, it } from 'vitest';
import { buildSelectedActivityLegacyIds } from '../../../src/utils/activitySelection';

describe('buildSelectedActivityLegacyIds', () => {
  it('merges home going flags with profile activities', () => {
    const ids = buildSelectedActivityLegacyIds(
      [{ id: '1', going: false } as never, { id: '2', going: true } as never],
      [{ id: '3' } as never, { id: '4' } as never],
    );

    expect([...ids].sort((a, b) => a - b)).toEqual([2, 3, 4]);
  });

  it('dedupes when home and profile share the same legacy id', () => {
    const ids = buildSelectedActivityLegacyIds(
      [{ id: '42', going: true } as never],
      [{ id: '42' } as never],
    );

    expect([...ids]).toEqual([42]);
  });
});
