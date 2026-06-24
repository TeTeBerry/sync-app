import Taro, { useRouter } from '@tarojs/taro';
import { useEffect } from 'react';
import { ROUTES } from '@/utils/route';
import { buildQueryString } from '@/utils/queryString';

/**
 * Legacy redirect: old set-vote share links land here and forward to lineup vote mode.
 */
const SetVoteRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    const query: Record<string, string> = {};
    for (const [key, value] of Object.entries(router.params)) {
      if (value != null && value !== '') {
        query[key] = value;
      }
    }
    if (!query.id && query.activityLegacyId) {
      query.id = query.activityLegacyId;
    }
    query.voteMode = '1';
    const qs = buildQueryString(query);
    const url = qs ? `${ROUTES.ACTIVITY_LINEUP}?${qs}` : ROUTES.ACTIVITY_LINEUP;
    void Taro.redirectTo({ url });
  }, [router.params]);

  return null;
};

export default SetVoteRedirectPage;
