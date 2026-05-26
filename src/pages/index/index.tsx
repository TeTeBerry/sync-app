import "./home.scss";
import { useCallback } from "react";
import BottomNav from "../../components/BottomNav";
import { useHomeSummary, useNotificationUnreadCount } from "../../hooks/useSyncApi";
import { go, goAiMatch, ROUTES } from "../../utils/route";
import { HomeActivityFeed } from "./components/HomeActivityFeed";
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import { HomeMarketHero } from "./components/HomeMarketHero";
import {
  activityPosts,
  countdownParts,
  featuredEvents,
  type FeaturedMarketEvent,
} from "./homeMarketData";

const Home = () => {
  const { heat } = useHomeSummary();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const openAiMatch = useCallback((message?: string) => {
    if (message?.trim()) {
      goAiMatch({ tab: `ai`, initialMessage: message.trim() });
      return;
    }
    go(ROUTES.AIMATCH);
  }, []);

  const handleNotification = useCallback(() => {
    go(ROUTES.NOTIFICATIONS);
  }, []);

  const openFeaturedEvent = useCallback(() => {
    go(ROUTES.EVENTS);
  }, []);

  const startTeamMatch = useCallback((event: FeaturedMarketEvent) => {
    goAiMatch({
      tab: `ai`,
      initialMessage: `我想参加 ${event.title}，帮我找一起去的队友。`,
    });
  }, []);

  const activeTeamCount = heat.teamOrders;

  return (
    <div data-cmp="Home" className="s-home">
      <main className="s-home__main s-scrollbar-none">
        <HomeMarketHero
          unreadCount={unreadCount}
          onAgentClick={() => openAiMatch()}
          onNotificationClick={handleNotification}
        />

        <HomeCountdownCard eventName="Tomorrowland China" parts={countdownParts} />

        <HomeFeaturedEvents
          items={featuredEvents}
          onEventClick={openFeaturedEvent}
          onJoinClick={startTeamMatch}
        />

        <HomeActivityFeed items={activityPosts} onSeeAll={() => go(ROUTES.EVENTS)} />

        <div className="s-home__heat" aria-label="Today heat">
          {heat.people} 人正在发现 · {activeTeamCount} 个组队进行中
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
