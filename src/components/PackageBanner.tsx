import "./PackageBanner.scss";
import React from "react";
import { ChevronRightIcon, BuildingIcon, TruckIcon, UsersIcon, PackageIcon, type LucideIcon } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { go, ROUTES } from "../utils/route";

interface PackageBannerProps {
  participantCount?: number;
}

interface CatMeta {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  mod: "hotel" | "transport" | "combo";
}

const categories: CatMeta[] = [
  { id: `hotel`, labelKey: `home.package.hotel`, icon: BuildingIcon, mod: "hotel" },
  { id: `transport`, labelKey: `home.package.transport`, icon: TruckIcon, mod: "transport" },
  { id: `package`, labelKey: `home.package.combo`, icon: PackageIcon, mod: "combo" },
];

const PackageBanner: React.FC<PackageBannerProps> = ({
  participantCount = 238,
}) => {
  const { t } = useTranslation();

  return (
    <div
      data-cmp="PackageBanner"
      className="s-package-banner"
      onClick={() => go(ROUTES.PINDAN)}
    >
      <div className="s-package-banner__inner">
        <div className="s-package-banner__tag-wrap">
          <span className="s-package-banner__tag">{t("home.package.tag")}</span>
        </div>

        <div className="s-package-banner__head">
          <h2 className="s-package-banner__title">{t("home.package.title")}</h2>
          <ChevronRightIcon size={20} className="s-package-banner__chevron" />
        </div>

        <p className="s-package-banner__sub">
          {t("home.package.subtitle")}
        </p>

        <div className="s-package-banner__cats">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <div
                key={cat.id}
                className={`s-package-banner__cat s-package-banner__cat--${cat.mod}`}
              >
                <IconComp size={26} className="s-package-banner__cat-icon" strokeWidth={1.8} />
                <span className="s-package-banner__cat-label">{t(cat.labelKey)}</span>
              </div>
            );
          })}
        </div>

        <div className="s-package-banner__stats">
          <UsersIcon size={14} className="s-package-banner__stats-icon" />
          <span className="s-package-banner__stats-text">
            <Trans
              i18nKey="home.package.stats"
              values={{ count: participantCount }}
              components={{ 1: <span className="s-package-banner__stats-num" /> }}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PackageBanner;
