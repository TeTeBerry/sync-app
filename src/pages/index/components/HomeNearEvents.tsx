import type { FC } from "react";
import { useTranslation } from "react-i18next";
import EventCard from "../../../components/EventCard";
import type { NearEventBrief } from "../mockData";
import { SectionChevronLink } from "./SectionChevronLink";

export type HomeNearEventsProps = {
  /** 占位数据；接入接口后可直接替换为服务端列表 */
  events: NearEventBrief[];
};

/**
 * 「最近活动」列表：复用卡片组件，右上角链式入口后续可对接路由。
 */
export const HomeNearEvents: FC<HomeNearEventsProps> = ({ events }) => {
  const { t } = useTranslation();

  return (
    <section className="s-near-events">
      <div className="s-near-events__top">
        <span>{t("home.nearEvents")}</span>
        <SectionChevronLink labelKey="common.more" />
      </div>
      {events.map((ev) => (
        <EventCard key={`${ev.title}-${ev.distance}`} {...ev} />
      ))}
    </section>
  );
};
