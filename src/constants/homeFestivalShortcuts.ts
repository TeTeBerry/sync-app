/** Homepage AI composer chips — must match backend HOME_FESTIVAL_SHORTCUTS submitText */
export const HOME_FESTIVAL_SHORTCUT_CHIPS = [
  { key: 'storm', label: '风暴电音节', submitText: '风暴电音节' },
  { key: 'edc', label: 'EDC China', submitText: 'EDC China' },
  { key: 'tomorrowland', label: 'Tomorrowland', submitText: 'Tomorrowland Thailand' },
  { key: 'vac-zhuhai', label: 'VAC横琴', submitText: '横琴VAC电音节' },
  { key: 'guan', label: 'GUAN电音节', submitText: 'GUAN电音节' },
  { key: 'edc-thailand', label: 'EDC Thailand', submitText: 'EDC Thailand' },
] as const;

export type HomeFestivalShortcutChip = (typeof HOME_FESTIVAL_SHORTCUT_CHIPS)[number];
