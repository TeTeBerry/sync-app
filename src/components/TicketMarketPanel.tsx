import "./TicketMarketPanel.scss";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  TagIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { matchActivity, createTicket } from "../api/syncApi";
import { isApiEnabled } from "../constants/api";
import {
  ticketFilterTabs,
  ticketListings as defaultListings,
  type TicketFilterKey,
  type TicketListing,
} from "../data/ticketListings";
import { invalidateTicketQueries, useTicketList } from "../hooks/useSyncApi";
import { getClientUserId, getClientUserName } from "../utils/session";
import TicketTradeModal, { type TicketTradeFormValues, type TicketTradeMode } from "./TicketTradeModal";
import { Button, cn } from "./ui";
import { useQueryClient } from "@tanstack/react-query";

export interface TicketMarketPanelProps {
  listings?: TicketListing[];
  className?: string;
  /** 为 false 时不请求门票接口（如 AI 页未切到门票 tab） */
  fetchEnabled?: boolean;
  /** 从 AI 聊天卡片跳转时高亮对应挂单 */
  highlightTicketId?: string | null;
  onHighlightDone?: () => void;
}

const TicketMarketPanel: React.FC<TicketMarketPanelProps> = ({
  listings: listingsProp,
  className,
  fetchEnabled = true,
  highlightTicketId = null,
  onHighlightDone,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [ticketFilter, setTicketFilter] = useState<TicketFilterKey>(`all`);
  const [ticketModalMode, setTicketModalMode] = useState<TicketTradeMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const apiQuery = useTicketList(ticketFilter, { enabled: fetchEnabled });
  const listings = listingsProp ?? apiQuery.listings ?? defaultListings;

  useEffect(() => {
    if (!fetchEnabled || listingsProp || !isApiEnabled()) return;
    void apiQuery.refetch();
  }, [apiQuery.refetch, fetchEnabled, listingsProp, ticketFilter]);

  useEffect(() => {
    if (!highlightTicketId) return;
    setTicketFilter(`all`);
  }, [highlightTicketId]);

  const filteredTickets = useMemo(() => {
    if (listingsProp) {
      if (ticketFilter === `all`) return listingsProp;
      return listingsProp.filter((item) => item.type === ticketFilter);
    }
    return listings;
  }, [listings, listingsProp, ticketFilter]);

  useEffect(() => {
    if (!highlightTicketId || !fetchEnabled) return;

    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`aim-ticket-item-${highlightTicketId}`)?.scrollIntoView({
        behavior: `smooth`,
        block: `center`,
      });
    }, 280);

    const clearTimer = window.setTimeout(() => onHighlightDone?.(), 2800);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [fetchEnabled, filteredTickets, highlightTicketId, onHighlightDone]);

  const handleTicketSubmit = useCallback(
    async (values: TicketTradeFormValues) => {
      if (!isApiEnabled()) {
        setTicketModalMode(null);
        return;
      }

      setSubmitError(null);
      setIsSubmitting(true);

      try {
        const activity = await matchActivity(values.eventName);
        if (!activity?.code) {
          throw new Error(t(`aimatch.ticket.eventNotFound`));
        }

        await createTicket({
          activityId: activity.code,
          quantity: values.quantity,
          type: values.mode,
          skuCode: values.seat || "GA",
          price: values.unitPrice,
          eventDate: values.eventDate,
          contact: values.contact,
          displayEventName: values.eventName.trim() || undefined,
          userId: getClientUserId(),
          userName: getClientUserName(),
        });

        await Promise.all([apiQuery.refetch(), invalidateTicketQueries(queryClient)]);
        setTicketModalMode(null);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : t(`common.loadError`));
      } finally {
        setIsSubmitting(false);
      }
    },
    [apiQuery, queryClient, t],
  );

  const openModal = (mode: TicketTradeMode) => {
    setSubmitError(null);
    setTicketModalMode(mode);
  };

  return (
    <>
      <div className={cn(`s-ticket-market`, className)}>
        {apiQuery.isLoading && !listingsProp ? (
          <p className="s-aim-panel-hint">{t(`common.loading`)}</p>
        ) : null}
        {apiQuery.isError && !listingsProp ? (
          <p className="s-aim-panel-hint s-aim-panel-hint--error">{t(`common.loadError`)}</p>
        ) : null}

        <div className="s-aim-action-row">
          <Button
            className="s-aim-action-row__btn s-aim-action-row__btn--sell s-aim-action-row__btn--shadowed"
            onClick={() => openModal(`sell`)}
          >
            <ArrowUpRightIcon size={15} />
            {t("aimatch.ticket.sell")}
          </Button>
          <Button
            className="s-aim-action-row__btn s-aim-action-row__btn--buy s-aim-action-row__btn--shadowed"
            onClick={() => openModal(`buy`)}
          >
            <ArrowDownLeftIcon size={15} />
            {t("aimatch.ticket.buy")}
          </Button>
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
          {ticketFilterTabs.map((tab) => (
            <Button
              key={tab.key}
              className={cn(`s-aim-mini-tab`, ticketFilter === tab.key && `s-aim-mini-tab--active`)}
              onClick={() => setTicketFilter(tab.key)}
            >
              {t(tab.labelKey)}
            </Button>
          ))}
          <span className="s-aim-filter-row__extra">
            <ClockIcon size={10} />
            {t("common.liveUpdate")}
          </span>
        </div>

        <div className="s-aim-ticket-list">
          {filteredTickets.length === 0 ? (
            <p className="s-aim-panel-hint">{t(`common.empty`)}</p>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                id={`aim-ticket-item-${ticket.id}`}
                className={cn(
                  `s-aim-ticket-card`,
                  ticket.type === `buy` && `s-aim-ticket-card--buy`,
                  highlightTicketId === ticket.id && `s-aim-ticket-card--focused`,
                )}
              >
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
                  <Button
                    className={
                      ticket.type === `sell`
                        ? `s-aim-ticket-card__cta s-aim-ticket-card__cta--sell`
                        : `s-aim-ticket-card__cta s-aim-ticket-card__cta--buy`
                    }
                  >
                    {ticket.type === `sell` ? t("aimatch.ticket.buyTicket") : t("aimatch.ticket.contact")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TicketTradeModal
        open={ticketModalMode !== null}
        mode={ticketModalMode ?? `sell`}
        onClose={() => setTicketModalMode(null)}
        onSubmit={handleTicketSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </>
  );
};

export default TicketMarketPanel;
