import { describe, expect, it } from 'vitest';
import { shouldTriggerEventsAiSearch } from '@/domains/events-search/utils/shouldTriggerEventsAiSearch';

describe('shouldTriggerEventsAiSearch', () => {
  it('returns false for empty query', () => {
    expect(shouldTriggerEventsAiSearch('', 0)).toBe(false);
    expect(shouldTriggerEventsAiSearch('   ', 3)).toBe(false);
  });

  it('triggers AI when local filter finds nothing', () => {
    expect(shouldTriggerEventsAiSearch('7月欧洲 techno', 0)).toBe(true);
    expect(shouldTriggerEventsAiSearch('tomorrowland', 0)).toBe(true);
  });

  it('skips AI when local keyword matches exist', () => {
    expect(shouldTriggerEventsAiSearch('EDC', 2)).toBe(false);
    expect(shouldTriggerEventsAiSearch('Ultra', 1)).toBe(false);
  });

  it('triggers AI for month-only queries even when local has matches', () => {
    expect(shouldTriggerEventsAiSearch('7月', 5)).toBe(true);
    expect(shouldTriggerEventsAiSearch('7月电音节', 12)).toBe(true);
  });

  it('triggers AI for structured NL even when local has matches', () => {
    expect(shouldTriggerEventsAiSearch('7月欧洲 techno 活动', 2)).toBe(true);
    expect(shouldTriggerEventsAiSearch('韩国签证怎么办理？', 1)).toBe(true);
  });

  it('triggers AI for festival compare queries even when local has matches', () => {
    expect(shouldTriggerEventsAiSearch('storm vs ultra europe', 2)).toBe(true);
    expect(shouldTriggerEventsAiSearch('EDC和风暴哪个好', 3)).toBe(true);
  });
});
