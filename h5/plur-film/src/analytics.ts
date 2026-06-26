type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export type PlurFilmAnalyticsEvent =
  | 'plur_film_play_start'
  | 'plur_film_complete'
  | 'plur_film_skip'
  | 'plur_film_cta_find_team'
  | 'plur_film_cta_continue_sync'
  | 'plur_film_cta_guidelines'
  | 'plur_film_replay'
  | 'plur_film_sound_on';

export function logPlurFilmEvent(
  name: PlurFilmAnalyticsEvent,
  payload?: AnalyticsPayload,
): void {
  const body = { event: name, ts: Date.now(), ...payload };
  if (import.meta.env.DEV) {
    console.info('[plur-film analytics]', body);
  }
  window.dispatchEvent(new CustomEvent('plur-film-analytics', { detail: body }));
}
