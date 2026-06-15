import type { BackendActivity } from '../types/backend';
import { getActivityStatusFromActivity } from '../utils/activityStatus';

/** Homepage AI composer chips — must match backend HOME_FESTIVAL_SHORTCUTS submitText */
export const HOME_FESTIVAL_SHORTCUT_CHIPS = [
  {
    key: 'storm',
    label: '风暴电音节',
    submitText: '风暴电音节',
    fallbackTitle: '风暴电音节 深圳站',
    fallbackDate: '06/13-14',
  },
  {
    key: 'tomorrowland',
    label: 'Tomorrowland',
    submitText: 'Tomorrowland Thailand',
    fallbackTitle: 'Tomorrowland Thailand 2026',
    fallbackDate: '12/11-13',
  },
  {
    key: 'edc-thailand',
    label: 'EDC Thailand',
    submitText: 'EDC Thailand',
    fallbackTitle: 'EDC Thailand 2026',
    fallbackDate: '12/18-20',
  },
  {
    key: 'edc-korea',
    label: 'EDC Korea',
    submitText: 'EDC Korea',
    fallbackTitle: 'EDC Korea 2026',
    fallbackDate: '10/03-04',
  },
] as const;

export type HomeFestivalShortcutChip = (typeof HOME_FESTIVAL_SHORTCUT_CHIPS)[number];

function activityByCodeMap(
  activities?: BackendActivity[] | null,
): Map<string, BackendActivity> {
  const map = new Map<string, BackendActivity>();
  for (const activity of activities ?? []) {
    const code = activity.code?.trim().toLowerCase();
    if (code) {
      map.set(code, activity);
    }
  }
  return map;
}

function resolveChipActivityMeta(
  chip: HomeFestivalShortcutChip,
  byCode: Map<string, BackendActivity>,
): { date?: string; title?: string } {
  const activity = byCode.get(chip.key);
  if (activity) {
    return { date: activity.date, title: activity.name };
  }
  return { date: chip.fallbackDate, title: chip.fallbackTitle };
}

/** Hide festival chips after the catalog date range has ended. */
export function filterActiveHomeFestivalShortcutChips(
  activities?: BackendActivity[] | null,
  now?: Date,
): HomeFestivalShortcutChip[] {
  const byCode = activityByCodeMap(activities);

  return HOME_FESTIVAL_SHORTCUT_CHIPS.filter((chip) => {
    const meta = resolveChipActivityMeta(chip, byCode);
    return getActivityStatusFromActivity(meta.date, meta.title, now) !== 'ended';
  });
}

export function resolveActiveActivityChipKey(options: {
  activityLegacyId?: number;
  activityCode?: string;
  activityTitle?: string;
}): string | undefined {
  const { activityLegacyId, activityCode, activityTitle } = options;
  if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
    return undefined;
  }

  const code = activityCode?.trim().toLowerCase();
  if (code && HOME_FESTIVAL_SHORTCUT_CHIPS.some((chip) => chip.key === code)) {
    return code;
  }

  const title = activityTitle?.trim().toLowerCase() ?? '';
  if (!title) return undefined;

  for (const chip of HOME_FESTIVAL_SHORTCUT_CHIPS) {
    const label = chip.label.toLowerCase();
    const submitText = chip.submitText.toLowerCase();
    if (title.includes(label) || title.includes(submitText)) {
      return chip.key;
    }
  }

  return undefined;
}
