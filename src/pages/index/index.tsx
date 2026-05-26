import "./home.scss";
import { useCallback } from "react";
import BottomNav from "../../components/BottomNav";
import { useHomeSummary, useNotificationUnreadCount } from "../../hooks/useSyncApi";
import { go, goAiAssistant, goEventDetail, ROUTES } from "../../utils/route";
import { HomeActivityFeed } from "./components/HomeActivityFeed";
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import { HomePlazaHero } from "./components/HomePlazaHero";
import {
  activityPosts,
  countdownParts,
  featuredEvents,
  type FeaturedEvent,
} from "./homeData";

const Home = () => {
  const { heat } = useHomeSummary();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const openAiAssistant = useCallback((message?: string) => {
    if (message?.trim()) {
      goAiAssistant({ initialMessage: message.trim() });
      return;
    }
    go(ROUTES.AI_ASSISTANT);
  }, []);

  const handleNotification = useCallback(() => {
    go(ROUTES.NOTIFICATIONS);
  }, []);

  const openEventDetail = useCallback((event: FeaturedEvent) => {
    goEventDetail(event.id);
  }, []);

  const joinEvent = useCallback((event: FeaturedEvent) => {
    goEventDetail(event.id);
  }, []);

  const activeTeamCount = heat.teamOrders;

  return (
    <div data-cmp="Home" className="s-home">
      <main className="s-home__main s-scrollbar-none">
        <HomePlazaHero
          unreadCount={unreadCount}
          onAgentClick={() => openAiAssistant()}
          onNotificationClick={handleNotification}
        />

        <HomeCountdownCard eventName="Tomorrowland China" parts={countdownParts} />

        <HomeFeaturedEvents
          items={featuredEvents}
          onEventClick={openEventDetail}
          onJoinClick={joinEvent}
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
