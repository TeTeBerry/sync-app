export type PlurFilmFrom = 'first_visit' | 'about' | 'share' | string;

export type PlurFilmQuery = {
  activityLegacyId?: string;
  from?: PlurFilmFrom;
  lowMotion: boolean;
  locale: 'zh-CN' | 'en-US';
  exportMode: boolean;
};

export function parsePlurFilmQuery(search = window.location.search): PlurFilmQuery {
  const params = new URLSearchParams(search);
  const activityLegacyId = params.get('activityLegacyId')?.trim() || undefined;
  const from = params.get('from')?.trim() || undefined;
  const lowMotionParam = params.get('lowMotion');
  const storedLowMotion = localStorage.getItem('plurFilmLowMotion') === '1';
  const lowMotion =
    lowMotionParam === '1' || lowMotionParam === 'true' || storedLowMotion;
  const localeParam = params.get('locale')?.trim();
  const locale = localeParam === 'en-US' ? 'en-US' : 'zh-CN';
  const exportMode = params.get('export') === '1';
  return { activityLegacyId, from, lowMotion, locale, exportMode };
}

export function persistLowMotion(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem('plurFilmLowMotion', '1');
    return;
  }
  localStorage.removeItem('plurFilmLowMotion');
}
