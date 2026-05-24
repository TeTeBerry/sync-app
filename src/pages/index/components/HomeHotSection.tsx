import { ChevronRightIcon, FlameIcon, UsersIcon } from "lucide-react";
import { memo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { goPindan } from "../../../utils/route";
import { categoryToneClass } from "../home.styles";
import type { HotPinItem } from "../mockData";
import { SectionChevronLink } from "./SectionChevronLink";

export type HomeHotSectionProps = {
  items: HotPinItem[];
};

const rankToneClass = (rank: number) => {
  if (rank === 1) return `s-hot-rank--1`;
  if (rank === 2) return `s-hot-rank--2`;
  if (rank === 3) return `s-hot-rank--3`;
  return `s-hot-rank--default`;
};

const HotRow = memo(function HotRow({ item }: { item: HotPinItem }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="s-hot-row"
      onClick={() =>
        goPindan({
          activityId: item.id,
          type: item.pinType,
          highlightId: item.pinItemId,
        })
      }
    >
      <span className={`s-hot-rank ${rankToneClass(item.rank)}`}>{item.rank}</span>

      <div className="s-hot-row__main">
        <div className="s-hot-row__title-line">
          <span className="s-hot-row__title">{item.title}</span>
          <span className="s-hot-row__badge">{item.badge}</span>
        </div>
        <div className="s-hot-row__sub">
          <span className={`s-hot-row__category ${categoryToneClass[item.categoryTone]}`}>{item.category}</span>
          <span className="s-hot-row__people">
            <UsersIcon size={11} />
            {item.people}
          </span>
        </div>
      </div>

      <ChevronRightIcon size={16} className="s-hot-row__chevron" />
    </button>
  );
});

/**
 * 「正在热拼」纵向排行列表。
 */
export const HomeHotSection: FC<HomeHotSectionProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <section className="s-hot-section">
      <div className="s-home-section__top">
        <div className="s-home-section__heading">
          <FlameIcon size={15} />
          <span>{t("home.hot.title")}</span>
          <small>{t("home.hot.live")}</small>
        </div>
        <SectionChevronLink labelKey="common.all" onNavigate={() => goPindan()} />
      </div>

      <div className="s-hot-section__list">
        {items.map((item) => (
          <HotRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
