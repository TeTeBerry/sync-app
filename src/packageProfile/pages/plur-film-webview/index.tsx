import './plur-film-webview.scss';
import { WebView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '@/hooks/useI18n';
import {
  buildPlurFilmH5Src,
  handlePlurFilmBridgeAction,
  parsePlurFilmBridgeMessages,
} from '@/utils/plurFilmWebview.util';
import { showAppToast } from '@/utils/appToast';
import { goPlurCulture } from '@/utils/plurRoute';
import { ROUTES } from '@/utils/route';

function redirectToPlurCultureFallback(): void {
  const url = `${ROUTES.LEGAL_DOCUMENT}?doc=plur-culture`;
  Taro.redirectTo({ url }).catch(() => {
    goPlurCulture();
  });
}

export default function PlurFilmWebviewPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const handledRef = useRef(false);
  const fallbackTriggeredRef = useRef(false);

  const filmSrc = useMemo(
    () =>
      buildPlurFilmH5Src({
        activityLegacyId: router.params.activityLegacyId,
        from: router.params.from,
        locale,
      }),
    [locale, router.params.activityLegacyId, router.params.from],
  );

  useEffect(() => {
    if (!filmSrc) {
      redirectToPlurCultureFallback();
    }
  }, [filmSrc]);

  const handleMessage = useCallback((event: { detail: { data: unknown } }) => {
    const payload = parsePlurFilmBridgeMessages(event.detail.data);
    if (!payload || handledRef.current) {
      return;
    }
    if (payload.action === 'replay') {
      return;
    }
    handledRef.current = true;
    handlePlurFilmBridgeAction(payload);
  }, []);

  const handleError = useCallback(() => {
    if (fallbackTriggeredRef.current) {
      return;
    }
    fallbackTriggeredRef.current = true;
    console.error('[PlurFilmWebview] web-view load error', { filmSrc });
    showAppToast('短片加载失败', 'none');
    redirectToPlurCultureFallback();
  }, [filmSrc]);

  if (!filmSrc) {
    return null;
  }

  return (
    <WebView
      className="s-plur-film-webview__frame"
      data-cmp="PlurFilmWebview"
      src={filmSrc}
      onMessage={handleMessage}
      onError={handleError}
    />
  );
}
