import { FlameIcon, UsersIcon } from "lucide-react";
import { memo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { goPindan } from "../../../utils/route";
import type { HotEventItem } from "../mockData";

export type HomeHotSectionProps = {
  items: HotEventItem[];
};

const HotCard = memo(({ ev }: { ev: HotEventItem }) => {
  const { t } = useTranslation();

  return (
    <button type="button" className="s-hot-card" onClick={() => goPindan(ev.id)}>
      <div className="s-hot-card__img">
        <img className="s-hot-card__media" src={ev.image} alt={ev.title} />
        <div className="s-hot-card__corner-badge">{ev.badge}</div>
      </div>
      <div className="s-hot-card__body">
        <p className="s-hot-card__title">{ev.title}</p>
        <div className="s-hot-card__people">
          <UsersIcon size={10} />
          <span>{t("common.peopleJoining", { count: ev.people })}</span>
        </div>
      </div>
    </button>
  );
});
HotCard.displayName = `HomeHotSection.HotCard`;

/**
 * 「正在热拼」横向列表。
 */
export const HomeHotSection: FC<HomeHotSectionProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <section className="s-hot-section">
      <div className="s-hot-section__top">
        <div className="s-hot-section__heading">
          <FlameIcon size={15} />
          <span>{t("home.hot.title")}</span>
          <small>{t("common.liveUpdate")}</small>
        </div>
      </div>

      <div className="s-hot-section__tracks s-scrollbar-none">
        <div className="s-hot-section__tracks-inner">
          {items.map((ev) => (
            <HotCard key={ev.id} ev={ev} />
          ))}
        </div>
      </div>
    </section>
  );
};
