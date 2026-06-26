import { goLegalDocument } from '@/utils/legalRoute';
import {
  buildPlurFilmWebviewPageQuery,
  resolvePlurFilmH5BaseUrl,
  type GoPlurFilmWebviewOptions,
} from '@/utils/plurFilmWebview.util';
import { ROUTES, go } from '@/utils/route';

function buildPlurFilmWebviewUrl(query: Record<string, string>): string {
  const qs = new URLSearchParams(query).toString();
  return qs ? `${ROUTES.PLUR_FILM_WEBVIEW}?${qs}` : ROUTES.PLUR_FILM_WEBVIEW;
}

export function isPlurFilmH5Available(): boolean {
  const url = resolvePlurFilmH5BaseUrl();
  return url !== null && /^https:\/\//i.test(url);
}

export function goPlurCulture(): void {
  goLegalDocument('plur-culture');
}

/** Opens PLUR film H5 via web-view when HTTPS URL is configured; otherwise culture page. */
export function goPlurFilmFromEntry(options: GoPlurFilmWebviewOptions = {}): void {
  if (!isPlurFilmH5Available()) {
    goPlurCulture();
    return;
  }
  go(buildPlurFilmWebviewUrl(buildPlurFilmWebviewPageQuery(options)));
}
