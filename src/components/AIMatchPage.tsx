import "./AIMatchPage.scss";
import React, {
  type ComponentType,
  type FC,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import BottomNav from "./BottomNav";
import CreatePinDanModal from "./CreatePinDanModal";
import PageNavigation from "./PageNavigation";
import TicketMarketPanel from "./TicketMarketPanel";
import { Button, Input, cn } from "./ui";
import {
  CalendarIcon,
  CheckCircleIcon,
  FlameIcon,
  MapPinIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  TicketIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type MainTab = "ai" | "pindan" | "ticket" | "events";
type PinDanCategory = "hotel" | "transport";

const pinDanCategoryKeys: PinDanCategory[] = ["hotel", "transport"];

const activePinDans = [
  {
    id: 2,
    category: "hotel" as PinDanCategory,
    title: `三亚亚特兰蒂斯`,
    desc: `海景大床房 · 4人均摊`,
    price: 450,
    originalPrice: 1800,
    joined: 2,
    total: 4,
    date: `06/27-30`,
    location: `三亚`,
    image: `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80`,
    tags: [`海景房`, `含早餐`],
    urgent: false,
  },
  {
    id: 3,
    category: "transport" as PinDanCategory,
    title: `上海→三亚 商务舱拼`,
    desc: `浦东出发 · 4座同飞`,
    price: 1200,
    originalPrice: 4800,
    joined: 2,
    total: 4,
    date: `06/27`,
    location: `PVG→SYX`,
    image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80`,
    tags: [`商务舱`, `含行李`],
    urgent: true,
  },
];

const eventsList = [
  {
    id: 1,
    title: `S2O 三亚电音节`,
    date: `06/28–29 14:00`,
    location: `三亚海棠湾`,
    distance: `2.5 km`,
    image: `https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80`,
    attendees: 238,
    pinCount: 12,
    category: `户外电音`,
    hot: true,
    going: false,
  },
  {
    id: 2,
    title: `EDC China 2025`,
    date: `07/12–13 16:00`,
    location: `苏州阳澄湖`,
    distance: `15 km`,
    image: `https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80`,
    attendees: 512,
    pinCount: 35,
    category: `EDM节`,
    hot: true,
    going: true,
  },
  {
    id: 3,
    title: `Tomorrowland 预热派对`,
    date: `06/20 22:00`,
    location: `上海静安区`,
    distance: `5.0 km`,
    image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80`,
    attendees: 89,
    pinCount: 8,
    category: `Club 派对`,
    hot: false,
    going: false,
  },
  {
    id: 4,
    title: `Ultra Shanghai`,
    date: `08/02–03 14:00`,
    location: `上海世博公园`,
    distance: `8.3 km`,
    image: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80`,
    attendees: 320,
    pinCount: 27,
    category: `大型节日`,
    hot: false,
    going: true,
  },
];

type ChatMsg = { from: "ai" | "user"; text: string };

const quickReplyKeys = [`findBuddy`, `pinTicket`, `sellTicket`, `nearEvents`] as const;

const tabAccentCls: Record<MainTab, string> = {
  ai: `s-aim-tab--accent-ai`,
  pindan: `s-aim-tab--accent-pin`,
  ticket: `s-aim-tab--accent-ticket`,
  events: `s-aim-tab--accent-events`,
};

function AiChat() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState(``);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ from: `ai`, text: t(`aimatch.ai.welcome`) }]);
  }, [i18n.language, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: `smooth` });
  }, [messages]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, { from: `user`, text: trimmed }]);
      setInput(``);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: `ai`,
            text: t(`aimatch.ai.searching`, {
              query: trimmed,
              count: Math.floor(Math.random() * 5 + 3),
            }),
          },
        ]);
      }, 800);
    },
    [t],
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === `Enter`) {
        e.preventDefault();
        send(input);
      }
    },
    [input, send],
  );

  return (
    <div className="s-aim-ai">
      <div className="s-aim-ai__scroll">
        {messages.map((msg, i) => (
          <div key={i} className={`s-aim-ai__row${msg.from === `user` ? ` s-aim-ai__row--from-user` : ``}`}>
            <div className={`s-aim-ai__avatar${msg.from === `ai` ? `` : ` s-aim-ai__avatar--hidden`}`}>
              <SparklesIcon size={13} />
            </div>
            <div
              className={`s-aim-ai__bubble ${
                msg.from === `ai` ? `s-aim-ai__bubble--from-ai` : `s-aim-ai__bubble--from-user`
              }`}
            >
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="s-aim-ai__quick-row s-scrollbar-none">
        {quickReplyKeys.map((key) => (
          <Button
            key={key}
            className="s-aim-ai__quick-chip"
            onClick={() => send(t(`aimatch.ai.quickReplies.${key}`))}
          >
            {t(`aimatch.ai.quickReplies.${key}`)}
          </Button>
        ))}
      </div>

      <div className="s-aim-ai__composer">
        <div className="s-aim-ai__composer-inner">
          <Input
            variant="aim-chat"
            type="text"
            value={input}
            placeholder={t(`aimatch.ai.placeholder`)}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          <Button className="s-aim-ai__send" onClick={() => send(input)}>
            <SendIcon size={14} color="#fff" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const AIMatchPage: FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MainTab>(`ai`);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCategory, setCreateCategory] = useState<PinDanCategory>(`hotel`);
  const [goingIds, setGoingIds] = useState<number[]>([2, 4]);

  const toggleGoing = (id: number) => {
    setGoingIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const tabs: { key: MainTab; labelKey: string; Icon: ComponentType<{ size?: number | string }> }[] = [
    { key: `ai`, labelKey: `aimatch.tabs.ai`, Icon: SparklesIcon },
    { key: `pindan`, labelKey: `aimatch.tabs.pindan`, Icon: PlusIcon },
    { key: `ticket`, labelKey: `aimatch.tabs.ticket`, Icon: TicketIcon },
    { key: `events`, labelKey: `aimatch.tabs.events`, Icon: CalendarIcon },
  ];

  const eventFilterKeys = [`all`, `outdoor`, `edm`, `club`, `festival`] as const;

  const pinDanTabLabelKey: Record<PinDanCategory, string> = {
    hotel: `aimatch.pindan.hotel`,
    transport: `aimatch.pindan.transport`,
  };

  return (
    <div data-cmp="AIMatch" className="s-aim">
      <PageNavigation title={t("aimatch.title")} />

      <div className="s-aim-top-tabs">
        {tabs.map(({ key, labelKey, Icon }) => (
          <Button
            key={key}
            className={cn(`s-aim-tab`, activeTab === key && `s-aim-tab--active`, activeTab === key && tabAccentCls[key])}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={15} />
            {t(labelKey)}
          </Button>
        ))}
      </div>

      <div className={activeTab === `ai` ? `s-aim-ai-panel` : `s-aim-panel--hidden`}>
        <AiChat />
      </div>

      <div className={`s-aim-panel-block s-aim-pin s-aim-pin--${createCategory}${activeTab === `pindan` ? `` : ` s-aim-panel--hidden`}`}>
        <div className="s-aim-cta-banner">
          <Button className="s-aim-cta-banner__btn" onClick={() => setShowCreateModal(true)}>
            <PlusIcon size={18} />
            {t("aimatch.pindan.createNew")}
          </Button>
        </div>

        <div className="s-aim-pin-cat-tabs">
          {pinDanCategoryKeys.map((key) => (
            <Button
              key={key}
              className={cn(`s-aim-pin-cat-tabs__btn`, createCategory === key && `s-aim-pin-cat-tabs__btn--active`)}
              onClick={() => setCreateCategory(key)}
            >
              {t(pinDanTabLabelKey[key])}
            </Button>
          ))}
        </div>

        <div className="s-aim-stats-card">
          <div className="s-aim-stats-item">
            <strong>{activePinDans.filter((p) => p.category === createCategory).length}</strong>
            <span>{t("common.inProgress")}</span>
          </div>
          <div className="s-aim-stats-sep" />
          <div className="s-aim-stats-item">
            <strong>
              {activePinDans.filter((p) => p.category === createCategory).reduce((a, b) => a + b.joined, 0)}
            </strong>
            <span>{t("common.joined")}</span>
          </div>
          <div className="s-aim-stats-sep" />
          <div className="s-aim-stats-item">
            <strong>
              {activePinDans.filter((p) => p.category === createCategory).reduce((a, b) => a + (b.total - b.joined), 0)}
            </strong>
            <span>{t("common.spotsRemaining")}</span>
          </div>
        </div>

        <div className="s-aim-pin-list-head">
          <span className="s-aim-pin-list-head__title">{t("aimatch.pindan.currentOrders")}</span>
          <span className="s-aim-pin-list-head__sub">{t("common.liveUpdate")}</span>
        </div>

        <div className="s-aim-pin-card-wrap">
          {activePinDans
            .filter((p) => p.category === createCategory)
            .map((item) => {
              const pct = Math.round((item.joined / item.total) * 100);
              return (
                <div key={item.id} className={`s-aim-pin-card s-aim-pin-card--${item.category}`}>
                  <div className="s-aim-pin-card__media">
                    <img src={item.image} alt={item.title} />
                    {item.urgent && (
                      <div className="s-aim-pin-card__urgent">
                        <ZapIcon size={8} />
                        {t("common.urgent")}
                      </div>
                    )}
                    <div className="s-aim-pin-card__price-col">
                      <span className="s-aim-pin-card__price">¥{item.price}</span>
                      <span className="s-aim-pin-card__price-was">¥{item.originalPrice}</span>
                    </div>
                    <div className="s-aim-pin-card__bottom">
                      <div className="s-aim-pin-card__title-t">{item.title}</div>
                      <div className="s-aim-pin-card__desc-t">{item.desc}</div>
                    </div>
                  </div>

                  <div className="s-aim-pin-card__body">
                    <div className="s-aim-pin-card__meta">
                      <span className="s-aim-pin-card__meta-el">
                        <CalendarIcon size={11} />
                        {item.date}
                      </span>
                      <span className="s-aim-pin-card__meta-el">
                        <MapPinIcon size={11} />
                        {item.location}
                      </span>
                    </div>

                    <div className="s-aim-pin-card__tags">
                      {item.tags.map((t) => (
                        <span key={t} className="s-aim-pin-card__tag">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="s-aim-pin-card__prog-labels">
                      <span className="s-aim-pin-card__prog-text">
                        {t("common.joinedCount", { joined: item.joined, total: item.total })}
                      </span>
                      <span className="s-aim-pin-card__prog-pct">{pct}%</span>
                    </div>
                    <div className="s-aim-pin-card__prog-track">
                      <div className="s-aim-pin-card__prog-fill" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="s-aim-pin-card__actions">
                      <Button className="s-aim-pin-card__cta">{t("aimatch.pindan.join")}</Button>
                      <Button className="s-aim-pin-card__ghost">{t("common.share")}</Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className={`s-aim-ticket s-aim-panel-block${activeTab === `ticket` ? `` : ` s-aim-panel--hidden`}`}>
        <TicketMarketPanel />
      </div>

      <div className={`s-aim-events s-aim-panel-block${activeTab === `events` ? `` : ` s-aim-panel--hidden`}`}>
        <div className="s-aim-events__chips s-scrollbar-none">
          {eventFilterKeys.map((f) => (
            <Button
              key={f}
              className={cn(`s-aim-events__chip`, f === `all` && `s-aim-events__chip--all`)}
            >
              {t(`aimatch.events.filters.${f}`)}
            </Button>
          ))}
        </div>

        <div className="s-aim-events__list">
          {eventsList.map((ev) => (
            <div key={ev.id} className="s-aim-ev-card">
              <div className="s-aim-ev-card__media">
                <img src={ev.image} alt={ev.title} />
                {ev.hot && (
                  <div className="s-aim-ev-card__media-hot">
                    <FlameIcon size={9} />
                    {t("common.hot")}
                  </div>
                )}
                <div className="s-aim-ev-card__media-cat">{ev.category}</div>
                <div className="s-aim-ev-card__media-content">
                  <h3>{ev.title}</h3>
                  <div className="s-aim-ev-card__media-meta-row">
                    <div className="s-aim-ev-card__media-meta-el">
                      <CalendarIcon size={10} />
                      <span>{ev.date}</span>
                    </div>
                    <div className="s-aim-ev-card__media-meta-el">
                      <MapPinIcon size={10} />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="s-aim-ev-card__stats-row">
                <div className="s-aim-ev-card__stat-primary">
                  <UsersIcon size={11} />
                  <span className="s-aim-ev-card__stat-num">{ev.attendees}</span>
                  <span className="s-aim-ev-card__stat-lbl">{t("common.attendees")}</span>
                </div>
                <span className="s-aim-ev-card__stat-dot">·</span>
                <span className="s-aim-ev-card__stat-soft">{t("common.pinOrders", { count: ev.pinCount })}</span>
                <div className="s-aim-ev-card__dist-pill">
                  <MapPinIcon size={10} />
                  <span className="s-aim-ev-card__dist-text">{ev.distance}</span>
                </div>
              </div>

              <div className="s-aim-ev-card__btns-row">
                <Button
                  onClick={() => toggleGoing(ev.id)}
                  className={
                    goingIds.includes(ev.id)
                      ? `s-aim-ev-card__btn-going`
                      : `s-aim-ev-card__btn-going s-aim-ev-card__btn-going--idle`
                  }
                >
                  <CheckCircleIcon size={13} />
                  {goingIds.includes(ev.id) ? t("aimatch.events.registered") : t("aimatch.events.going")}
                </Button>
                <Button className="s-aim-ev-card__btn-buddy">
                  <UsersIcon size={13} />
                  {t("aimatch.events.findBuddy")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreatePinDanModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultCategory={createCategory}
      />

      <BottomNav />
    </div>
  );
};

export default AIMatchPage;
