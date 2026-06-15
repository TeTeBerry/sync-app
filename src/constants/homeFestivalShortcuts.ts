/** Homepage AI composer chips — must match backend HOME_FESTIVAL_SHORTCUTS submitText */
export const HOME_FESTIVAL_SHORTCUT_CHIPS = [
  { key: 'storm', label: '风暴电音节', submitText: '风暴电音节' },
  { key: 'tomorrowland', label: 'Tomorrowland', submitText: 'Tomorrowland Thailand' },
  { key: 'edc-thailand', label: 'EDC Thailand', submitText: 'EDC Thailand' },
] as const;

export type HomeFestivalShortcutChip = (typeof HOME_FESTIVAL_SHORTCUT_CHIPS)[number];

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
