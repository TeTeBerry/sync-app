import "./home.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";
import { useHomeSummary } from "../../hooks/useSyncApi";
import { go, ROUTES } from "../../utils/route";
import { HomeAiAssistant } from "./components/HomeAiAssistant";
import { HomeEventSignup } from "./components/HomeEventSignup";
import { HomeHeatBar } from "./components/HomeHeatBar";
import { HomeHotSection } from "./components/HomeHotSection";
import { HomeTicketZone } from "./components/HomeTicketZone";

const Home = () => {
  const { t } = useTranslation();
  const { heat, signupEvents, hotPins, ticketListings } = useHomeSummary();
  const openAiMatch = useCallback(() => go(ROUTES.AIMATCH), []);

  const handleNotification = useCallback(() => {
    void Taro.showToast({ title: t("home.notificationsComingSoon"), icon: "none" });
  }, [t]);

  return (
    <div data-cmp="Home" className="s-home">
      <TopBar variant="home" onAgentClick={openAiMatch} onNotificationClick={handleNotification} />

      <main className="s-home__main s-scrollbar-none">
        <HomeAiAssistant onSummon={openAiMatch} />

        <HomeEventSignup items={signupEvents} />

        <HomeHotSection items={hotPins} />

        <HomeHeatBar stats={heat} />

        <HomeTicketZone listings={ticketListings} />
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
