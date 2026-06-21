import { describe, expect, it } from 'vitest';
import {
  buildFeaturedEventsKey,
  resolveFeaturedIndexAfterListChange,
} from '@/pages/index/utils/homeFeaturedIndex';

describe('homeFeaturedIndex', () => {
  it('builds stable keys from event ids', () => {
    const key = buildFeaturedEventsKey([{ id: 1 }, { id: 4 }, { id: 5 }]);
    expect(key).toBe('1|4|5');
  });

  it('preserves index when featured list identity is unchanged', () => {
    const key = '1|4';
    expect(resolveFeaturedIndexAfterListChange(2, key, key, 3)).toBe(2);
  });

  it('resets index when featured list identity changes', () => {
    expect(resolveFeaturedIndexAfterListChange(2, '1|4', '4|5', 2)).toBe(0);
  });

  it('clamps index when list shrinks', () => {
    const key = '1|4|5';
    expect(resolveFeaturedIndexAfterListChange(2, key, key, 2)).toBe(1);
  });
});
