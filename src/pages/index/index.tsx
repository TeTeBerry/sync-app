import "./home.scss";
import { useCallback } from "react";
import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";
import { useHomeSummary, useNotificationUnreadCount } from "../../hooks/useSyncApi";
import { go, goAiMatch, ROUTES } from "../../utils/route";
import { HomeAiAssistant } from "./components/HomeAiAssistant";
import { HomeEventSignup } from "./components/HomeEventSignup";
import { HomeHeatBar } from "./components/HomeHeatBar";
import { HomeHotSection } from "./components/HomeHotSection";
import { HomeTicketZone } from "./components/HomeTicketZone";

const Home = () => {
  const { heat, signupEvents, hotPins } = useHomeSummary();
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

  return (
    <div data-cmp="Home" className="s-home">
      <TopBar
        variant="home"
        onAgentClick={openAiMatch}
        onNotificationClick={handleNotification}
        notificationCount={unreadCount}
      />

      <main className="s-home__main s-scrollbar-none">
        <HomeAiAssistant onOpenAiMatch={openAiMatch} />

        <HomeEventSignup items={signupEvents} />

        <HomeHotSection items={hotPins} />

        <HomeHeatBar stats={heat} />

        <HomeTicketZone />
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
