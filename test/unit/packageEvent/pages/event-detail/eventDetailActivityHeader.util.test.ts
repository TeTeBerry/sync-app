import { describe, expect, it } from 'vitest';
import { resolveEventDetailHeaderPresentation } from '@/packageEvent/pages/event-detail/eventDetailActivityHeader.util';

describe('resolveEventDetailHeaderPresentation', () => {
  it('shows skeleton while activity detail is loading', () => {
    const result = resolveEventDetailHeaderPresentation({
      hasValidEventId: true,
      query: { isLoading: true, isError: false, data: undefined },
    });

    expect(result.showHeaderSkeleton).toBe(true);
    expect(result.routeContentReady).toBe(true);
    expect(result.showActivityMissing).toBe(false);
  });

  it('shows missing state when query resolves empty', () => {
    const result = resolveEventDetailHeaderPresentation({
      hasValidEventId: true,
      query: { isLoading: false, isError: false, data: null },
    });

    expect(result.showActivityMissing).toBe(true);
    expect(result.showHeaderSkeleton).toBe(false);
  });

  it('builds meta line from date and location', () => {
    const result = resolveEventDetailHeaderPresentation({
      hasValidEventId: true,
      query: {
        isLoading: false,
        isError: false,
        data: {
          name: 'EDC',
          date: '2026-12-18',
          location: 'Pattaya',
        },
      },
    });

    expect(result.title).toBe('EDC');
    expect(result.metaLine).toBe('2026-12-18 · Pattaya');
    expect(result.loadError).toBe(false);
  });

  it('marks load error when query fails after loading', () => {
    const result = resolveEventDetailHeaderPresentation({
      hasValidEventId: true,
      query: { isLoading: false, isError: true, data: undefined },
    });

    expect(result.loadError).toBe(true);
    expect(result.showActivityMissing).toBe(true);
  });

  it('does not show skeleton for invalid event id', () => {
    const result = resolveEventDetailHeaderPresentation({
      hasValidEventId: false,
      query: { isLoading: true, isError: false, data: undefined },
    });

    expect(result.showHeaderSkeleton).toBe(false);
    expect(result.routeContentReady).toBe(false);
  });
});
