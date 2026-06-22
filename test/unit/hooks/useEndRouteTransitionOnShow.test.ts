import { describe, expect, it } from 'vitest';
import { shouldEndRouteTransitionOnShow } from '@/hooks/useEndRouteTransitionOnShow';
import { ROUTES } from '@/utils/route';

describe('shouldEndRouteTransitionOnShow', () => {
  it('does nothing when transition is inactive', () => {
    expect(
      shouldEndRouteTransitionOnShow(
        { active: false, tabTarget: ROUTES.EVENTS },
        ROUTES.HOME,
      ),
    ).toBe(false);
  });

  it('ends on stack pages during non-tab transitions', () => {
    expect(shouldEndRouteTransitionOnShow({ active: true }, undefined)).toBe(true);
  });

  it('does not end tab transition from stack pages without own tab', () => {
    expect(
      shouldEndRouteTransitionOnShow(
        { active: true, tabTarget: ROUTES.EVENTS },
        undefined,
      ),
    ).toBe(false);
  });

  it('skips intermediate tab pages while switching to another tab', () => {
    expect(
      shouldEndRouteTransitionOnShow(
        { active: true, tabTarget: ROUTES.EVENTS },
        ROUTES.HOME,
      ),
    ).toBe(false);
  });

  it('ends when the destination tab becomes visible', () => {
    expect(
      shouldEndRouteTransitionOnShow(
        { active: true, tabTarget: ROUTES.EVENTS },
        ROUTES.EVENTS,
      ),
    ).toBe(true);
  });
});
