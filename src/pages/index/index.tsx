import "./home.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";
import { go, ROUTES } from "../../utils/route";
import { HomeAiAssistant } from "./components/HomeAiAssistant";
import { HomeEventSignup } from "./components/HomeEventSignup";
import { HomeHeatBar } from "./components/HomeHeatBar";
import { HomeHotSection } from "./components/HomeHotSection";
import { HomeTicketZone } from "./components/HomeTicketZone";
import { eventSignupItems, homeHeatStats, hotPinItems, ticketListings } from "./mockData";

const Home = () => {
  const { t } = useTranslation();
  const openAiMatch = useCallback(() => go(ROUTES.AIMATCH), []);

  const handleNotification = useCallback(() => {
    void Taro.showToast({ title: t("home.notificationsComingSoon"), icon: "none" });
  }, [t]);

  return (
    <div data-cmp="Home" className="s-home">
      <TopBar variant="home" onAgentClick={openAiMatch} onNotificationClick={handleNotification} />

      <main className="s-home__main s-scrollbar-none">
        <HomeAiAssistant onSummon={openAiMatch} />

        <HomeEventSignup items={eventSignupItems} />

        <HomeHotSection items={hotPinItems} />

        <HomeHeatBar stats={homeHeatStats} />

        <HomeTicketZone listings={ticketListings} />
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
