import { describe, expect, it } from 'vitest';
import { filterActiveHomeFestivalShortcutChips } from '@/constants/homeFestivalShortcuts';
import type { BackendActivity } from '@/types/backend';

function activity(
  partial: Pick<BackendActivity, 'code' | 'date' | 'name'>,
): BackendActivity {
  return {
    _id: partial.code,
    legacyId: 1,
    code: partial.code,
    name: partial.name,
    date: partial.date,
  };
}

describe('filterActiveHomeFestivalShortcutChips', () => {
  it('hides ended festivals using catalog dates', () => {
    const chips = filterActiveHomeFestivalShortcutChips(
      undefined,
      new Date(2026, 5, 15, 12, 0, 0, 0),
    );

    expect(chips.map((chip) => chip.key).sort()).toEqual(
      ['edc-korea', 'edc-thailand', 'tomorrowland'].sort(),
    );
  });

  it('prefers live activity dates over fallback metadata', () => {
    const chips = filterActiveHomeFestivalShortcutChips(
      [
        activity({
          code: 'storm',
          name: '风暴电音节 深圳站 2026',
          date: '06/13-14',
        }),
      ],
      new Date(2026, 11, 1, 12, 0, 0, 0),
    );

    expect(chips.map((chip) => chip.key)).not.toContain('storm');
    expect(chips.map((chip) => chip.key)).toContain('tomorrowland');
  });

  it('keeps in-progress and upcoming festivals', () => {
    const chips = filterActiveHomeFestivalShortcutChips(
      undefined,
      new Date(2026, 5, 1, 12, 0, 0, 0),
    );

    expect(chips.map((chip) => chip.key).sort()).toEqual(
      ['edc-korea', 'edc-thailand', 'storm', 'tomorrowland'].sort(),
    );
  });
});
