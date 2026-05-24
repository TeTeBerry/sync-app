import { ArrowDownLeftIcon, ArrowUpRightIcon, TagIcon, TicketIcon } from "lucide-react";
import { memo, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { miniTagToneClass } from "../home.styles";
import type { TicketListingItem, TicketTabKey } from "../mockData";
import { SectionChevronLink } from "./SectionChevronLink";

export type HomeTicketZoneProps = {
  listings: TicketListingItem[];
};

const ticketTabKeys: TicketTabKey[] = [`all`, `sell`, `buy`];

const TicketRow = memo(function TicketRow({ ticket }: { ticket: TicketListingItem }) {
  const { t } = useTranslation();
  const isSell = ticket.type === `sell`;

  return (
    <div className="s-ticket-row">
      <div
        className={`s-ticket-row__icon-circle ${
          isSell ? `s-ticket-row__icon-circle--sell` : `s-ticket-row__icon-circle--buy`
        }`}
      >
        {isSell ? (
          <ArrowUpRightIcon size={20} strokeWidth={2.5} />
        ) : (
          <ArrowDownLeftIcon size={20} strokeWidth={2.5} />
        )}
      </div>

      <div className="s-ticket-row__mid">
        <div className="s-ticket-row__title-line">
          <span>{ticket.event}</span>
          <span className={`s-ticket-row__mini-tag ${miniTagToneClass[ticket.tagTone]}`}>{ticket.tag}</span>
        </div>
        <div className="s-ticket-row__seat">
          <TagIcon size={10} />
          <span>{ticket.seat}</span>
        </div>
        <div className="s-ticket-row__seller">
          <img className="s-ticket-row__seller-avatar" src={ticket.avatar} alt="" />
          <span>{ticket.seller}</span>
          <span className="s-ticket-row__seller-dot">·</span>
          <span>{ticket.time}</span>
        </div>
      </div>

      <div className="s-ticket-row__aside">
        <div className="s-ticket-row__price-num">
          <span className="s-ticket-row__price-currency">¥</span>
          <strong
            className={
              isSell ? `s-ticket-row__price-value s-ticket-row__price-value--sell` : `s-ticket-row__price-value s-ticket-row__price-value--buy`
            }
          >
            {ticket.price}
          </strong>
        </div>
        {isSell && ticket.originalPrice > 0 && (
          <span className="s-ticket-row__was">¥{ticket.originalPrice}</span>
        )}
        <button type="button" className={isSell ? `s-ticket-row__btn-sell` : `s-ticket-row__btn-buy`}>
          {isSell ? t("home.ticket.buyNow") : t("home.ticket.contact")}
        </button>
      </div>
    </div>
  );
});

/**
 * 门票专区：tabs + 列表；过滤逻辑内聚，`TicketRow` 使用 `memo` 减轻无谓重渲染。
 */
export const HomeTicketZone: FC<HomeTicketZoneProps> = ({ listings }) => {
  const { t } = useTranslation();
  const [ticketTab, setTicketTab] = useState<TicketTabKey>(`all`);

  const filteredTickets = useMemo(() => {
    return listings.filter((item) => {
      if (ticketTab === `all`) return true;
      if (ticketTab === `sell`) return item.type === `sell`;
      return item.type === `buy`;
    });
  }, [listings, ticketTab]);

  return (
    <section className="s-ticket-zone">
      <div className="s-ticket-zone__top">
        <div className="s-ticket-zone__lead">
          <TicketIcon size={15} />
          <span>{t("home.ticket.title")}</span>
          <small>{t("home.ticket.guarantee")}</small>
        </div>
        <SectionChevronLink labelKey="common.all" />
      </div>

      <div className="s-ticket-zone__tabs">
        {ticketTabKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`s-ticket-zone__tab${ticketTab === key ? ` s-ticket-zone__tab--active` : ``}`}
            onClick={() => setTicketTab(key)}
          >
            {t(`home.ticket.tabs.${key}`)}
          </button>
        ))}
      </div>

      <div className="s-ticket-zone__list">
        {filteredTickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  );
};
