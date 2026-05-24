import "./home.scss";
import { PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";
import { go, ROUTES } from "../../utils/route";
import { HomeAiAssistant } from "./components/HomeAiAssistant";
import { HomeHotSection } from "./components/HomeHotSection";
import { HomeNearEvents } from "./components/HomeNearEvents";
import { HomeTicketZone } from "./components/HomeTicketZone";
import { hotEvents, nearEventsMock, ticketListings } from "./mockData";

/**
 * 首页：区块组件与 mock 分离，横向热区用 ScrollView / Image（Taro），便于多端一致与后续接入数据。
 */
const Home = () => {
  const { t } = useTranslation();
  const openAiMatch = useCallback(() => go(ROUTES.AIMATCH), []);

  return (
    <div data-cmp="Home" className="s-home">
      <TopBar showLanguageSwitch />

      <main className="s-home__main s-scrollbar-none">
        <HomeAiAssistant onSummon={openAiMatch} />

        <div className="s-home__divider" />

        <HomeHotSection items={hotEvents} />

        <HomeTicketZone listings={ticketListings} />

        <HomeNearEvents events={nearEventsMock} />
      </main>

      <button type="button" className="s-home__fab" aria-label={t("home.fabLabel")}>
        <PlusIcon size={28} />
      </button>

      <BottomNav />
    </div>
  );
};

export default Home;
