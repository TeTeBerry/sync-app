import "./tickets.scss";
import React from "react";
import { useTranslation } from "react-i18next";
import PageNavigation from "../../components/PageNavigation";
import TicketMarketPanel from "../../components/TicketMarketPanel";

const TicketsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div data-cmp="Tickets" className="s-tickets-page">
      <PageNavigation title={t("home.ticket.title")} />
      <TicketMarketPanel className="s-tickets-page__panel" />
    </div>
  );
};

export default TicketsPage;
