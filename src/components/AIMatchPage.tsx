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
  ChevronRightIcon,
  FlameIcon,
  MapPinIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  TicketIcon,
  PackageIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Taro from "@tarojs/taro";
import { useQueryClient } from "@tanstack/react-query";
import { useAiChatStream } from "../hooks/useAiChatStream";
import { invalidatePindanQueries, invalidateTicketQueries, useEventList, usePinDanList } from "../hooks/useSyncApi";
import type { PinDanCategory } from "../utils/apiMappers";
import { joinPindan } from "../api/syncApi";
import { isApiEnabled } from "../constants/api";
import { getClientUserId } from "../utils/session";
import { getPindanJoinUiState, isPindanJoinDisabled } from "../utils/pindanJoinState";
import type { PinDanCardUi } from "../utils/apiMappers";
import {
  useAimatchPageStore,
  usePindanSessionStore,
  useScrollHighlight,
} from "../stores";

type MainTab = "ai" | "pindan" | "ticket" | "events";

const pinDanCategoryKeys: PinDanCategory[] = ["package", "hotel", "transport"];

const quickReplyKeys = [`findBuddy`, `buyTicket`, `sellTicket`, `nearEvents`] as const;

const tabAccentCls: Record<MainTab, string> = {
  ai: `s-aim-tab--accent-ai`,
  pindan: `s-aim-tab--accent-pin`,
  ticket: `s-aim-tab--accent-ticket`,
  events: `s-aim-tab--accent-events`,
};

function AiChat({
  onTicketCreated,
  onTicketCardClick,
  onPindanCardClick,
  onPindanJoined,
}: {
  onTicketCreated?: (ticketId: string) => void;
  onTicketCardClick?: (ticketId: string) => void;
  onPindanCardClick?: (
    legacyId: number,
    category: PinDanCategory,
    activityLegacyId?: number,
  ) => void;
  onPindanJoined?: () => void;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState(``);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mockReply = useCallback(
    (query: string) =>
      t(`aimatch.ai.searching`, {
        query,
        count: Math.floor(Math.random() * 5 + 3),
      }),
    [t],
  );

  const handleTicketCreated = useCallback(
    (ticketId: string) => {
      onTicketCreated?.(ticketId);
      void Taro.showToast({ title: t(`aimatch.ticket.published`), icon: `success` });
    },
    [onTicketCreated, t],
  );

  const { messages, isStreaming, isLoadingHistory, send } = useAiChatStream({
    welcomeText: t(`aimatch.ai.welcome`),
    mockReply,
    streamErrorText: t(`aimatch.ai.streamError`),
    onTicketCreated: handleTicketCreated,
    onPindanJoined,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: `smooth` });
  }, [messages]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      setInput(``);
      void send(trimmed);
    },
    [isStreaming, send],
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === `Enter`) {
        e.preventDefault();
        submit(input);
      }
    },
    [input, submit],
  );

  return (
    <div className="s-aim-ai">
      <div className="s-aim-ai__scroll">
        {isLoadingHistory ? (
          <p className="s-aim-panel-hint">{t(`common.loading`)}</p>
        ) : null}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`s-aim-ai__row${msg.from === `user` ? ` s-aim-ai__row--from-user` : ``}`}
          >
            <div className={`s-aim-ai__avatar${msg.from === `ai` ? `` : ` s-aim-ai__avatar--hidden`}`}>
              <SparklesIcon size={13} />
            </div>
            <div className={cn(`s-aim-ai__content`, msg.from === `user` && `s-aim-ai__content--from-user`)}>
              <div
                className={cn(
                  `s-aim-ai__bubble`,
                  msg.from === `ai` ? `s-aim-ai__bubble--from-ai` : `s-aim-ai__bubble--from-user`,
                  msg.streaming && `s-aim-ai__bubble--streaming`,
                  msg.streaming && !msg.text && `s-aim-ai__bubble--waiting`,
                )}
              >
                {msg.streaming && !msg.text ? (
                  <span className="s-aim-ai__typing" aria-label={t(`aimatch.ai.thinking`)}>
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
              {msg.pindanCard ? (
                <button
                  type="button"
                  className={cn(
                    `s-aim-ai__pindan-card`,
                    `s-aim-ai__pindan-card--${msg.pindanCard.category}`,
                  )}
                  onClick={() =>
                    onPindanCardClick?.(
                      msg.pindanCard!.legacyId,
                      msg.pindanCard!.category,
                      msg.pindanCard!.activityLegacyId,
                    )
                  }
                >
                  <div className="s-aim-ai__pindan-card__icon">
                    <PackageIcon size={16} />
                  </div>
                  <div className="s-aim-ai__pindan-card__body">
                    <span className="s-aim-ai__pindan-card__label">
                      {msg.pindanCard.activityLegacyId
                        ? t(`aimatch.pindan.activityCardTitle`)
                        : t(`aimatch.pindan.joinedCardTitle`)}
                    </span>
                    <span className="s-aim-ai__pindan-card__title">{msg.pindanCard.title}</span>
                    {msg.pindanCard.subtitle ? (
                      <span className="s-aim-ai__pindan-card__subtitle">{msg.pindanCard.subtitle}</span>
                    ) : null}
                    <span className="s-aim-ai__pindan-card__meta">
                      {[msg.pindanCard.date, msg.pindanCard.location].filter(Boolean).join(` · `)}
                    </span>
                    <span className="s-aim-ai__pindan-card__price">¥{msg.pindanCard.price}</span>
                  </div>
                  <ChevronRightIcon size={16} className="s-aim-ai__pindan-card__chev" />
                </button>
              ) : null}
              {msg.ticketCard ? (
                <button
                  type="button"
                  className={cn(
                    `s-aim-ai__ticket-card`,
                    msg.ticketCard.type === `buy` && `s-aim-ai__ticket-card--buy`,
                  )}
                  onClick={() => onTicketCardClick?.(msg.ticketCard!.id)}
                >
                  <div className="s-aim-ai__ticket-card__icon">
                    <TicketIcon size={16} />
                  </div>
                  <div className="s-aim-ai__ticket-card__body">
                    <span className="s-aim-ai__ticket-card__label">
                      {t(`aimatch.ticket.createdCardTitle`)}
                    </span>
                    <span className="s-aim-ai__ticket-card__event">{msg.ticketCard.event}</span>
                    <span className="s-aim-ai__ticket-card__meta">{msg.ticketCard.seat}</span>
                    <span className="s-aim-ai__ticket-card__price">¥{msg.ticketCard.price}</span>
                  </div>
                  <ChevronRightIcon size={16} className="s-aim-ai__ticket-card__chev" />
                </button>
              ) : null}
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
            disabled={isStreaming}
            onClick={() => submit(t(`aimatch.ai.quickReplies.${key}`))}
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
            disabled={isStreaming}
            placeholder={t(`aimatch.ai.placeholder`)}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          <Button className="s-aim-ai__send" disabled={isStreaming} onClick={() => submit(input)}>
            <SendIcon size={14} color="#fff" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const AIMatchPage: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const activeTab = useAimatchPageStore((state) => state.activeTab);
  const createCategory = useAimatchPageStore((state) => state.createCategory);
  const filterActivityLegacyId = useAimatchPageStore((state) => state.filterActivityLegacyId);
  const highlightTicketId = useAimatchPageStore((state) => state.highlightTicketId);
  const highlightPindanId = useAimatchPageStore((state) => state.highlightPindanId);
  const showCreateModal = useAimatchPageStore((state) => state.showCreateModal);
  const goingIds = useAimatchPageStore((state) => state.goingIds);
  const setActiveTab = useAimatchPageStore((state) => state.setActiveTab);
  const setCreateCategory = useAimatchPageStore((state) => state.setCreateCategory);
  const focusPindanCard = useAimatchPageStore((state) => state.focusPindanCard);
  const focusActivityPindan = useAimatchPageStore((state) => state.focusActivityPindan);
  const focusTicket = useAimatchPageStore((state) => state.focusTicket);
  const clearPindanHighlight = useAimatchPageStore((state) => state.clearPindanHighlight);
  const clearActivityFilter = useAimatchPageStore((state) => state.clearActivityFilter);
  const clearTicketHighlight = useAimatchPageStore((state) => state.clearTicketHighlight);
  const openCreateModal = useAimatchPageStore((state) => state.openCreateModal);
  const closeCreateModal = useAimatchPageStore((state) => state.closeCreateModal);
  const toggleGoing = useAimatchPageStore((state) => state.toggleGoing);
  const joinedPindanIds = usePindanSessionStore((state) => state.joinedIds);

  const { events: eventsList, isLoading: eventsLoading, isError: eventsError, refetch: refetchEvents } =
    useEventList({ enabled: activeTab === `events` });
  const {
    items: activePinDans,
    isLoading: pindanLoading,
    isError: pindanError,
    refetch: refetchPindan,
  } = usePinDanList(createCategory, { enabled: activeTab === `pindan` });

  const handleTicketCreated = useCallback(
    (_ticketId: string) => {
      void invalidateTicketQueries(queryClient);
    },
    [queryClient],
  );

  const handlePindanCardClick = useCallback(
    (legacyId: number, category: PinDanCategory, activityLegacyId?: number) => {
      if (activityLegacyId != null) {
        focusActivityPindan(
          activityLegacyId,
          category,
          legacyId > 0 ? legacyId : undefined,
        );
      } else {
        focusPindanCard(legacyId, category);
      }
      void invalidatePindanQueries(queryClient);
    },
    [focusActivityPindan, focusPindanCard, queryClient],
  );

  const handlePindanJoined = useCallback(() => {
    void invalidatePindanQueries(queryClient);
  }, [queryClient]);

  const categoryPinDans = React.useMemo(
    () =>
      activePinDans.filter((item) => {
        if (item.category !== createCategory) return false;
        if (
          filterActivityLegacyId != null &&
          item.activityLegacyId !== filterActivityLegacyId
        ) {
          return false;
        }
        return true;
      }),
    [activePinDans, createCategory, filterActivityLegacyId],
  );

  const handleJoinPindan = useCallback(
    async (item: PinDanCardUi) => {
      const legacyId = Number(item.id);
      if (!Number.isFinite(legacyId)) return;

      const joinState = getPindanJoinUiState(item, joinedPindanIds, legacyId);
      if (joinState !== `join`) return;

      if (!isApiEnabled()) {
        void Taro.showToast({ title: t(`pindan.joined`), icon: `success` });
        return;
      }

      try {
        await joinPindan(legacyId, getClientUserId());
        void invalidatePindanQueries(queryClient);
        void Taro.showToast({ title: t(`pindan.joined`), icon: `success` });
      } catch {
        void Taro.showToast({ title: t(`common.requestFailed`), icon: `none` });
      }
    },
    [joinedPindanIds, queryClient, t],
  );

  useScrollHighlight({
    highlightId: highlightPindanId,
    elementId: (id) => `aim-pindan-item-${id}`,
    enabled: activeTab === "pindan" && highlightPindanId != null,
    ready: categoryPinDans.some((item) => item.id === highlightPindanId),
    scrollDelayMs: 120,
    clearDelayMs: 3200,
    onClear: () => {
      clearPindanHighlight();
      clearActivityFilter();
    },
  });

  const handleTicketCardClick = useCallback(
    (ticketId: string) => {
      focusTicket(ticketId);
      void invalidateTicketQueries(queryClient);
    },
    [focusTicket, queryClient],
  );

  const tabs: { key: MainTab; labelKey: string; Icon: ComponentType<{ size?: number | string }> }[] = [
    { key: `ai`, labelKey: `aimatch.tabs.ai`, Icon: SparklesIcon },
    { key: `pindan`, labelKey: `aimatch.tabs.pindan`, Icon: PlusIcon },
    { key: `ticket`, labelKey: `aimatch.tabs.ticket`, Icon: TicketIcon },
    { key: `events`, labelKey: `aimatch.tabs.events`, Icon: CalendarIcon },
  ];

  const eventFilterKeys = [`all`, `outdoor`, `edm`, `club`, `festival`] as const;

  const pinDanTabLabelKey: Record<PinDanCategory, string> = {
    package: `pindan.tabs.package`,
    hotel: `aimatch.pindan.hotel`,
    transport: `aimatch.pindan.transport`,
  };

  return (
    <div data-cmp="AIMatch" className="s-aim">
      <header className="s-aim-header">
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
      </header>

      <div className="s-aim-body">
      <div className={activeTab === `ai` ? `s-aim-ai-panel` : `s-aim-panel--hidden`}>
        <AiChat
          onTicketCreated={handleTicketCreated}
          onTicketCardClick={handleTicketCardClick}
          onPindanCardClick={handlePindanCardClick}
          onPindanJoined={handlePindanJoined}
        />
      </div>

      <div className={`s-aim-panel-block s-aim-pin s-aim-pin--${createCategory}${activeTab === `pindan` ? `` : ` s-aim-panel--hidden`}`}>
        <div className="s-aim-cta-banner">
          <Button className="s-aim-cta-banner__btn" onClick={openCreateModal}>
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
            <strong>{categoryPinDans.length}</strong>
            <span>{t("common.inProgress")}</span>
          </div>
          <div className="s-aim-stats-sep" />
          <div className="s-aim-stats-item">
            <strong>
              {categoryPinDans.reduce((a, b) => a + b.joined, 0)}
            </strong>
            <span>{t("common.joined")}</span>
          </div>
          <div className="s-aim-stats-sep" />
          <div className="s-aim-stats-item">
            <strong>
              {categoryPinDans.reduce((a, b) => a + (b.total - b.joined), 0)}
            </strong>
            <span>{t("common.spotsRemaining")}</span>
          </div>
        </div>

        <div className="s-aim-pin-list-head">
          <span className="s-aim-pin-list-head__title">{t("aimatch.pindan.currentOrders")}</span>
          <span className="s-aim-pin-list-head__sub">{t("common.liveUpdate")}</span>
        </div>

        {pindanLoading ? <p className="s-aim-panel-hint">{t("common.loading")}</p> : null}
        {pindanError ? (
          <p className="s-aim-panel-hint s-aim-panel-hint--error">
            {t("common.loadError")}{" "}
            <button type="button" className="s-aim-panel-hint__retry" onClick={() => void refetchPindan()}>
              {t("common.retry")}
            </button>
          </p>
        ) : null}

        <div className="s-aim-pin-card-wrap">
          {!pindanLoading && categoryPinDans.length === 0 ? (
            <p className="s-aim-panel-hint">{t("common.empty")}</p>
          ) : (
            categoryPinDans.map((item) => {
              const pct = Math.round((item.joined / item.total) * 100);
              const legacyId = Number(item.id);
              const joinState = getPindanJoinUiState(item, joinedPindanIds, legacyId);
              const joinLabel =
                joinState === `joined`
                  ? t(`pindan.joined`)
                  : joinState === `full`
                    ? t(`common.full`)
                    : t(`aimatch.pindan.join`);

              return (
                <div
                  key={item.id}
                  id={`aim-pindan-item-${item.id}`}
                  className={cn(
                    `s-aim-pin-card s-aim-pin-card--${item.category}`,
                    highlightPindanId === item.id && `s-aim-pin-card--focused`,
                  )}
                >
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
                      <Button
                        className={cn(
                          `s-aim-pin-card__cta`,
                          isPindanJoinDisabled(joinState) && `s-aim-pin-card__cta--inactive`,
                        )}
                        disabled={isPindanJoinDisabled(joinState)}
                        onClick={() => void handleJoinPindan(item)}
                      >
                        {joinLabel}
                      </Button>
                      <Button className="s-aim-pin-card__ghost">{t("common.share")}</Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={`s-aim-ticket s-aim-panel-block${activeTab === `ticket` ? `` : ` s-aim-panel--hidden`}`}>
        <TicketMarketPanel
          fetchEnabled={activeTab === `ticket`}
          highlightTicketId={highlightTicketId}
          onHighlightDone={clearTicketHighlight}
        />
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
          {eventsLoading ? <p className="s-aim-panel-hint">{t("common.loading")}</p> : null}
          {eventsError ? (
            <p className="s-aim-panel-hint s-aim-panel-hint--error">
              {t("common.loadError")}{" "}
              <button type="button" className="s-aim-panel-hint__retry" onClick={() => void refetchEvents()}>
                {t("common.retry")}
              </button>
            </p>
          ) : null}
          {!eventsLoading && eventsList.length === 0 ? (
            <p className="s-aim-panel-hint">{t("common.empty")}</p>
          ) : null}
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
      </div>

      <CreatePinDanModal
        open={showCreateModal}
        onClose={closeCreateModal}
        defaultCategory={createCategory}
      />

      <BottomNav />
    </div>
  );
};

export default AIMatchPage;
