import { markOnboardingConvertedFromPlurFilm } from '@/utils/firstRunOrchestrator.util';
import { goLegalDocument } from '@/utils/legalRoute';
import { markPlurEntrySeen } from '@/utils/plurEntryStorage';
import { ROUTES, go, goEventDetail } from '@/utils/route';

function buildHomeUrl(query: Record<string, string>): string {
  const qs = new URLSearchParams(query).toString();
  return qs ? `${ROUTES.HOME}?${qs}` : ROUTES.HOME;
}

export type PlurFilmFrom = 'first_visit' | 'about' | 'share' | string;

export type PlurFilmBridgeAction =
  | 'skip'
  | 'complete'
  | 'find_team'
  | 'continue_sync'
  | 'open_guidelines'
  | 'replay';

export type PlurFilmBridgePayload = {
  action: PlurFilmBridgeAction;
  activityLegacyId?: string;
  from?: PlurFilmFrom;
  plurFilmConverted?: '1';
  onboardingHighlightStep?: string;
};

export type GoPlurFilmWebviewOptions = {
  activityLegacyId?: string | number;
  from?: PlurFilmFrom;
};

const PLUR_H5_BASE_RE = /^https?:\/\//i;

function normalizePlurFilmH5Base(raw: string | undefined | null): string | null {
  let value = raw?.trim();
  if (!value) {
    return null;
  }
  if (/%[0-9A-Fa-f]{2}/.test(value)) {
    try {
      value = decodeURIComponent(value);
    } catch {
      // keep original when query decoding fails
    }
  }
  if (!PLUR_H5_BASE_RE.test(value)) {
    return null;
  }
  return value.endsWith('/') ? value : `${value}/`;
}

export function resolvePlurFilmH5BaseUrl(): string | null {
  return normalizePlurFilmH5Base(process.env.TARO_APP_PLUR_FILM_H5_URL);
}

export function buildPlurFilmWebviewPageQuery(
  options: GoPlurFilmWebviewOptions = {},
): Record<string, string> {
  const query: Record<string, string> = {};
  if (options.activityLegacyId != null && String(options.activityLegacyId).trim()) {
    query.activityLegacyId = String(options.activityLegacyId).trim();
  }
  if (options.from?.trim()) {
    query.from = options.from.trim();
  }
  return query;
}

export function buildPlurFilmH5Src(input: {
  activityLegacyId?: string;
  from?: string;
  locale?: string;
}): string | null {
  const base = resolvePlurFilmH5BaseUrl();
  if (!base) {
    return null;
  }

  const params = new URLSearchParams();
  if (input.activityLegacyId?.trim()) {
    params.set('activityLegacyId', input.activityLegacyId.trim());
  }
  if (input.from?.trim()) {
    params.set('from', input.from.trim());
  }
  if (input.locale?.trim()) {
    params.set('locale', input.locale.trim());
  }
  const qs = params.toString();
  const page = base.endsWith('index.html') ? base : `${base}index.html`;
  return qs ? `${page}?${qs}` : page;
}

export function parsePlurFilmBridgeMessages(
  data: unknown,
): PlurFilmBridgePayload | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const last = data[data.length - 1];
  if (!last || typeof last !== 'object') {
    return null;
  }
  const action = (last as PlurFilmBridgePayload).action;
  if (typeof action !== 'string') {
    return null;
  }
  return last as PlurFilmBridgePayload;
}

function runAfterWebviewClose(run: () => void): void {
  // H5 triggers navigateBack after postMessage; run navigation once the stack settles.
  setTimeout(run, 0);
}

export function handlePlurFilmBridgeAction(payload: PlurFilmBridgePayload): void {
  switch (payload.action) {
    case 'replay':
      return;
    case 'skip':
    case 'complete':
      markPlurEntrySeen();
      return;
    case 'find_team': {
      markPlurEntrySeen();
      if (payload.plurFilmConverted === '1') {
        markOnboardingConvertedFromPlurFilm();
      }
      const legacyRaw = payload.activityLegacyId?.trim();
      runAfterWebviewClose(() => {
        const legacyId = legacyRaw ? Number(legacyRaw) : NaN;
        if (Number.isFinite(legacyId) && legacyId > 0) {
          goEventDetail(legacyId, { focusPosts: true });
          return;
        }
        go(buildHomeUrl({ onboardingHighlightStep: '2' }));
      });
      return;
    }
    case 'continue_sync': {
      markPlurEntrySeen();
      const step = payload.onboardingHighlightStep?.trim() || '2';
      runAfterWebviewClose(() => {
        go(buildHomeUrl({ onboardingHighlightStep: step }));
      });
      return;
    }
    case 'open_guidelines': {
      markPlurEntrySeen();
      runAfterWebviewClose(() => {
        goLegalDocument('community-guidelines');
      });
      return;
    }
    default:
      return;
  }
}
