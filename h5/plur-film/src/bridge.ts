import type { PlurFilmFrom } from './query';

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

type WxMiniProgram = {
  postMessage?: (input: { data: PlurFilmBridgePayload }) => void;
  navigateTo?: (input: { url: string }) => void;
  navigateBack?: (input?: { delta?: number }) => void;
  redirectTo?: (input: { url: string }) => void;
};

declare global {
  interface Window {
    __wxjs_environment?: string;
    wx?: { miniProgram?: WxMiniProgram };
  }
}

export function isWechatMiniProgram(): boolean {
  return (
    window.__wxjs_environment === 'miniprogram' ||
    /miniprogram/i.test(navigator.userAgent)
  );
}

export function postToMiniProgram(payload: PlurFilmBridgePayload): void {
  window.wx?.miniProgram?.postMessage?.({ data: payload });
}

export function buildEventDetailUrl(activityLegacyId: string): string {
  const query = new URLSearchParams({
    id: activityLegacyId,
    activityLegacyId,
    focusPosts: '1',
    plurFilmConverted: '1',
  });
  return `/packageEvent/pages/event-detail/index?${query.toString()}`;
}

export function buildHomeWithOnboardingUrl(highlightStep = 2): string {
  const query = new URLSearchParams({
    onboardingHighlightStep: String(highlightStep),
  });
  return `/pages/index/index?${query.toString()}`;
}

export function buildLegalDocumentUrl(): string {
  return '/packageProfile/pages/legal-document/index?doc=community-guidelines';
}

export function closeMiniProgramWebview(): void {
  window.wx?.miniProgram?.navigateBack?.({ delta: 1 });
}

export function emitBridge(payload: PlurFilmBridgePayload): void {
  postToMiniProgram(payload);
  window.dispatchEvent(new CustomEvent('plur-film-bridge', { detail: payload }));
}
