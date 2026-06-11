import './GlobalAiAgentFab.scss';
import Taro from '@tarojs/taro';
import { useCallback, useMemo } from 'react';
import { Sparkles } from '../icons';
import { Button } from '../ui';
import { requireAuth } from '../../utils/authGate';
import { parseActivityLegacyId } from '../../utils/activityLegacyId';
import {
  goAiAssistant,
  ROUTES,
  useActiveRoutePath,
  warmAiAssistant,
} from '../../utils/route';

const ROUTES_WITH_TAB_BAR = new Set<string>([
  ROUTES.HOME,
  ROUTES.EVENTS,
  ROUTES.PROFILE,
  ROUTES.EVENT_DETAIL,
  ROUTES.MY_ITINERARY,
  ROUTES.PROFILE_POSTS,
  ROUTES.AI_ASSISTANT,
]);

const ACTIVITY_CONTEXT_ROUTES = new Set<string>([
  ROUTES.EVENT_DETAIL,
  ROUTES.MY_ITINERARY,
  ROUTES.EXCLUSIVE_ITINERARY,
]);

function resolveActivityLegacyIdFromCurrentPage(): number | undefined {
  const pages = Taro.getCurrentPages();
  const page = pages[pages.length - 1] as
    | { options?: Record<string, string | undefined> }
    | undefined;
  const options = page?.options ?? {};
  return (
    parseActivityLegacyId(options.id) ??
    parseActivityLegacyId(options.activityLegacyId) ??
    undefined
  );
}

/** Global floating AI entry — bottom-right, above tab bar when present. */
export default function GlobalAiAgentFab() {
  const routePath = useActiveRoutePath();

  const hidden = routePath === ROUTES.AI_ASSISTANT;
  const withTabBar = ROUTES_WITH_TAB_BAR.has(routePath);

  const activityLegacyId = useMemo(() => {
    if (!ACTIVITY_CONTEXT_ROUTES.has(routePath)) {
      return undefined;
    }
    return resolveActivityLegacyIdFromCurrentPage();
  }, [routePath]);

  const handleOpen = useCallback(() => {
    requireAuth(() => {
      goAiAssistant(activityLegacyId != null ? { activityLegacyId } : undefined);
    }, 'ai_match');
  }, [activityLegacyId]);

  if (hidden) {
    return null;
  }

  return (
    <Button
      data-cmp="GlobalAiAgentFab"
      className={[
        's-global-ai-fab',
        withTabBar ? 's-global-ai-fab--with-tabbar' : 's-global-ai-fab--stack',
      ].join(' ')}
      hoverClass="s-global-ai-fab--pressed"
      aria-label="AI 智能助手"
      onTouchStart={warmAiAssistant}
      onClick={handleOpen}
    >
      <Sparkles size={24} color="#ffffff" />
    </Button>
  );
}
