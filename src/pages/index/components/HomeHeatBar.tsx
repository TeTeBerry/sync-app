import { TrendingUpIcon } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export type HomeHeatStats = {
  people: number;
  pinOrders: number;
  growthPercent: number;
};

export type HomeHeatBarProps = {
  stats: HomeHeatStats;
};

export const HomeHeatBar: FC<HomeHeatBarProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="s-home-heat">
      <div className="s-home-heat__label">
        <TrendingUpIcon size={14} />
        <span>{t("home.heat.title")}</span>
      </div>
      <div className="s-home-heat__stats">
        <span>{t("home.heat.people", { count: stats.people })}</span>
        <span className="s-home-heat__sep" aria-hidden />
        <span>{t("home.heat.pinOrders", { count: stats.pinOrders })}</span>
        <span className="s-home-heat__sep" aria-hidden />
        <span className="s-home-heat__growth">↑ {stats.growthPercent}%</span>
      </div>
    </div>
  );
};
