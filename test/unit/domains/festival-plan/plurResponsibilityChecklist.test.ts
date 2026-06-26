import { describe, expect, it } from 'vitest';
import {
  PLURR_RESPONSIBILITY_ORDER,
  PLURR_RESPONSIBILITY_TOTAL,
  createEmptyPlurrResponsibilityState,
} from '@/domains/festival-plan/plurResponsibilityChecklist';

describe('plurResponsibilityChecklist', () => {
  it('defines six items in product order', () => {
    expect(PLURR_RESPONSIBILITY_ORDER).toEqual([
      'hydration',
      'tell_someone',
      'earplugs_shoes',
      'exit_plan',
      'leave_no_trace',
      'look_out',
    ]);
    expect(PLURR_RESPONSIBILITY_TOTAL).toBe(6);
  });

  it('creates empty state with all keys false', () => {
    const state = createEmptyPlurrResponsibilityState();
    expect(Object.keys(state)).toHaveLength(6);
    expect(Object.values(state).every((value) => value === false)).toBe(true);
  });
});
