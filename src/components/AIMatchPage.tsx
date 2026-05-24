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
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  FlameIcon,
  MapPinIcon,
  PlusIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type MainTab = "ai" | "pindan" | "ticket" | "events";
type PinDanCategory = "hotel" | "transport";

const pinDanCategoryIcons: Record<PinDanCategory, ComponentType<{ size?: number | string }>> = {
  hotel: MapPinIcon,
  transport: ZapIcon,
};

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

const ticketListings = [
  {
    id: 1,
    type: "sell" as const,
    event: `Tomorrowland 2025`,
    seat: `VIP B区 · 2张`,
    price: 880,
    originalPrice: 1200,
    seller: `Mia`,
    avatar: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80`,
    tag: `急出`,
    tone: `primary` as const,
    time: `1小时前`,
    verified: true,
  },
  {
    id: 2,
    type: "buy" as const,
    event: `EDC China 2025`,
    seat: `普通区 · 1张`,
    price: 560,
    originalPrice: 0,
    seller: `Leo`,
    avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80`,
    tag: `求购`,
    tone: `secondary` as const,
    time: `3小时前`,
    verified: true,
  },
  {
    id: 3,
    type: "sell" as const,
    event: `S2O 三亚电音节`,
    seat: `水上区 · 4张`,
    price: 420,
    originalPrice: 680,
    seller: `Zara`,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80`,
    tag: `9折`,
    tone: `amber` as const,
    time: `5小时前`,
    verified: false,
  },
  {
    id: 4,
    type: "buy" as const,
    event: `Ultra Shanghai`,
    seat: `Front Stage · 2张`,
    price: 1100,
    originalPrice: 0,
    seller: `Jake`,
    avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80`,
    tag: `高价求`,
    tone: `cyan` as const,
    time: `8小时前`,
    verified: true,
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
          <button
            key={key}
            type="button"
            onClick={() => send(t(`aimatch.ai.quickReplies.${key}`))}
            className="s-aim-ai__quick-chip"
          >
            {t(`aimatch.ai.quickReplies.${key}`)}
          </button>
        ))}
      </div>

      <div className="s-aim-ai__composer">
        <div className="s-aim-ai__composer-inner">
          <input
            type="text"
            value={input}
            placeholder={t(`aimatch.ai.placeholder`)}
            className="s-aim-ai__input"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          <button type="button" onClick={() => send(input)} className="s-aim-ai__send">
            <SendIcon size={14} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

const AIMatchPage: FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MainTab>(`ai`);
  const [ticketFilter, setTicketFilter] = useState<"all" | "sell" | "buy">(`all`);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCategory, setCreateCategory] = useState<PinDanCategory>(`hotel`);
  const [goingIds, setGoingIds] = useState<number[]>([2, 4]);

  const toggleGoing = (id: number) => {
    setGoingIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredTickets = ticketListings.filter((t) => {
    if (ticketFilter === `all`) return true;
    return t.type === ticketFilter;
  });

  const tabs: { key: MainTab; labelKey: string; Icon: ComponentType<{ size?: number | string }> }[] = [
    { key: `ai`, labelKey: `aimatch.tabs.ai`, Icon: SparklesIcon },
    { key: `pindan`, labelKey: `aimatch.tabs.pindan`, Icon: PlusIcon },
    { key: `ticket`, labelKey: `aimatch.tabs.ticket`, Icon: TicketIcon },
    { key: `events`, labelKey: `aimatch.tabs.events`, Icon: CalendarIcon },
  ];

  const ticketFilterKeys = [
    { key: `all` as const, labelKey: `aimatch.ticket.tabs.all` },
    { key: `sell` as const, labelKey: `aimatch.ticket.tabs.selling` },
    { key: `buy` as const, labelKey: `aimatch.ticket.tabs.buying` },
  ];

  const eventFilterKeys = [`all`, `outdoor`, `edm`, `club`, `festival`] as const;

  const pinDanGroupLabelKey: Record<PinDanCategory, string> = {
    hotel: `aimatch.pindan.hotelGroup`,
    transport: `aimatch.pindan.transportGroup`,
  };

  const pinDanTabLabelKey: Record<PinDanCategory, string> = {
    hotel: `aimatch.pindan.hotel`,
    transport: `aimatch.pindan.transport`,
  };

  return (
    <div data-cmp="AIMatch" className="s-aim">
      <div className="s-aim-top-tabs">
        {tabs.map(({ key, labelKey, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`s-aim-tab${activeTab === key ? ` s-aim-tab--active ${tabAccentCls[key]}` : ``}`}
          >
            <Icon size={15} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className={activeTab === `ai` ? `s-aim-ai-panel` : `s-aim-panel--hidden`}>
        <AiChat />
      </div>

      <div className={`s-aim-panel-block s-aim-pin s-aim-pin--${createCategory}${activeTab === `pindan` ? `` : ` s-aim-panel--hidden`}`}>
        <div className="s-aim-cta-banner">
          <button type="button" className="s-aim-cta-banner__btn" onClick={() => setShowCreateModal(true)}>
            <PlusIcon size={18} />
            {t("aimatch.pindan.createNew")}
          </button>
        </div>

        <div className="s-aim-pin-cat-tabs">
          {pinDanCategoryKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={`s-aim-pin-cat-tabs__btn${createCategory === key ? ` s-aim-pin-cat-tabs__btn--active` : ``}`}
              onClick={() => setCreateCategory(key)}
            >
              {t(pinDanTabLabelKey[key])}
            </button>
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
                      <button type="button" className="s-aim-pin-card__cta">
                        {t("aimatch.pindan.join")}
                      </button>
                      <button type="button" className="s-aim-pin-card__ghost">
                        {t("common.share")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className={`s-aim-ticket s-aim-panel-block${activeTab === `ticket` ? `` : ` s-aim-panel--hidden`}`}>
        <div className="s-aim-action-row">
          <button type="button" className="s-aim-action-row__btn s-aim-action-row__btn--sell s-aim-action-row__btn--shadowed">
            <ArrowUpRightIcon size={15} />
            {t("aimatch.ticket.sell")}
          </button>
          <button type="button" className="s-aim-action-row__btn s-aim-action-row__btn--buy s-aim-action-row__btn--shadowed">
            <ArrowDownLeftIcon size={15} />
            {t("aimatch.ticket.buy")}
          </button>
        </div>

        <div className="s-aim-banner-row">
          <div className="s-aim-banner-row__icon-bg">
            <ShieldCheckIcon size={18} />
          </div>
          <div className="s-aim-banner-row__titles">
            <p>{t("aimatch.ticket.guaranteeTitle")}</p>
            <small>{t("aimatch.ticket.guaranteeSub")}</small>
          </div>
          <ChevronRightIcon size={14} className="s-aim-banner-row__chev" />
        </div>

        <div className="s-aim-filter-row s-scrollbar-none">
          {ticketFilterKeys.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTicketFilter(tab.key)}
              className={`s-aim-mini-tab${ticketFilter === tab.key ? ` s-aim-mini-tab--active` : ``}`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
          <span className="s-aim-filter-row__extra">
            <ClockIcon size={10} />
            {t("common.liveUpdate")}
          </span>
        </div>

        <div className="s-aim-ticket-list">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className={`s-aim-ticket-card${ticket.type === `buy` ? ` s-aim-ticket-card--buy` : ``}`}>
              <div className="s-aim-ticket-card__row">
                <div
                  className={`s-aim-ticket-card__icon-shell${
                    ticket.type === `sell` ? ` s-aim-ticket-card__icon-shell--sell` : ` s-aim-ticket-card__icon-shell--buy`
                  }`}
                >
                  {ticket.type === `sell` ? (
                    <ArrowUpRightIcon size={20} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownLeftIcon size={20} strokeWidth={2.5} />
                  )}
                </div>

                <div className="s-aim-ticket-card__main">
                  <div className="s-aim-ticket-card__title-row">
                    <span className="s-aim-ticket-card__event-title">{ticket.event}</span>
                    <span className={`s-aim-ticket-card__tag s-aim-ticket-card__tag--${ticket.tone}`}>{ticket.tag}</span>
                  </div>
                  <div className="s-aim-ticket-card__mid">
                    <TagIcon size={10} />
                    <span>{ticket.seat}</span>
                  </div>
                  <div className="s-aim-ticket-card__seller-row">
                    <img src={ticket.avatar} alt={ticket.seller} />
                    <span>{ticket.seller}</span>
                    {ticket.verified && (
                      <span className="s-aim-ticket-card__verified">
                        <CheckCircleIcon size={9} />
                        {t("common.verified")}
                      </span>
                    )}
                    <span className="s-aim-ticket-card__time">{ticket.time}</span>
                  </div>
                </div>
              </div>

              <div className="s-aim-ticket-card__foot">
                <div className="s-aim-ticket-card__deal">
                  <span className="s-aim-ticket-card__deal-prefix">¥</span>
                  <span
                    className={
                      ticket.type === `sell`
                        ? `s-aim-ticket-card__deal-num s-aim-ticket-card__deal-num--sell`
                        : `s-aim-ticket-card__deal-num s-aim-ticket-card__deal-num--buy`
                    }
                  >
                    {ticket.price}
                  </span>
                  {ticket.type === `sell` && ticket.originalPrice > 0 && (
                    <span className="s-aim-ticket-card__deal-was">¥{ticket.originalPrice}</span>
                  )}
                </div>
                <button
                  type="button"
                  className={
                    ticket.type === `sell`
                      ? `s-aim-ticket-card__cta s-aim-ticket-card__cta--sell`
                      : `s-aim-ticket-card__cta s-aim-ticket-card__cta--buy`
                  }
                >
                  {ticket.type === `sell` ? t("aimatch.ticket.buyTicket") : t("aimatch.ticket.contact")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`s-aim-events s-aim-panel-block${activeTab === `events` ? `` : ` s-aim-panel--hidden`}`}>
        <div className="s-aim-events__chips s-scrollbar-none">
          {eventFilterKeys.map((f) => (
            <button
              key={f}
              type="button"
              className={`s-aim-events__chip${f === `all` ? ` s-aim-events__chip--all` : ``}`}
            >
              {t(`aimatch.events.filters.${f}`)}
            </button>
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
                <button
                  type="button"
                  onClick={() => toggleGoing(ev.id)}
                  className={
                    goingIds.includes(ev.id)
                      ? `s-aim-ev-card__btn-going`
                      : `s-aim-ev-card__btn-going s-aim-ev-card__btn-going--idle`
                  }
                >
                  <CheckCircleIcon size={13} />
                  {goingIds.includes(ev.id) ? t("aimatch.events.registered") : t("aimatch.events.going")}
                </button>
                <button type="button" className="s-aim-ev-card__btn-buddy">
                  <UsersIcon size={13} />
                  {t("aimatch.events.findBuddy")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`s-aim-modal${showCreateModal ? `` : ` s-aim-modal--off`}`}>
        <div className="s-aim-modal__backdrop" onClick={() => setShowCreateModal(false)} />

        <div className="s-aim-modal__sheet">
          <div className="s-aim-modal__head">
            <h2>{t("aimatch.pindan.modal.title")}</h2>
            <button type="button" className="s-aim-modal__close" onClick={() => setShowCreateModal(false)}>
              <XIcon size={14} />
            </button>
          </div>

          <span className="s-aim-modal__label">{t("aimatch.pindan.modal.selectType")}</span>
          <div className="s-aim-modal__type-grid">
            {pinDanCategoryKeys.map((key) => {
              const CatIcon = pinDanCategoryIcons[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCreateCategory(key)}
                  className={`s-aim-modal__type-opt s-aim-modal__type-opt--${key}${
                    createCategory === key ? ` s-aim-modal__type-opt--selected` : ``
                  }`}
                >
                  <CatIcon size={20} />
                  <span className="s-aim-modal__type-opt-label">{t(pinDanGroupLabelKey[key])}</span>
                </button>
              );
            })}
          </div>

          <div className="s-aim-modal__fields">
            <input placeholder={t("aimatch.pindan.modal.eventName")} className="s-aim-modal__field-full" />
            <div className="s-aim-modal__row2">
              <input placeholder={t("aimatch.pindan.modal.date")} className="s-aim-modal__field-half" />
              <input placeholder={t("aimatch.pindan.modal.location")} className="s-aim-modal__field-half" />
            </div>
            <div className="s-aim-modal__row2">
              <input placeholder={t("aimatch.pindan.modal.pricePerPerson")} className="s-aim-modal__field-half" />
              <input placeholder={t("aimatch.pindan.modal.groupSize")} className="s-aim-modal__field-half" />
            </div>
          </div>

          <button type="button" className="s-aim-modal__submit" onClick={() => setShowCreateModal(false)}>
            {t("aimatch.pindan.modal.submit")}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AIMatchPage;
