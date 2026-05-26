import "./BottomNav.scss";
import React from "react";
import {
  CalendarDaysIcon,
  HomeIcon,
  UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTES, reLaunchTo, useActiveRoutePath } from "../utils/route";

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const activePath = useActiveRoutePath();

  const navItems = [
    { path: ROUTES.HOME, icon: HomeIcon, labelKey: "nav.home" },
    { path: ROUTES.EVENTS, icon: CalendarDaysIcon, labelKey: "nav.events" },
    { path: ROUTES.PROFILE, icon: UserIcon, labelKey: "nav.profile" },
  ] as const;

  return (
    <div data-cmp="BottomNav" className="s-bottom-nav s-pb-safe">
      <div className="s-bottom-nav__row">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          const Icon = item.icon;
          return (
            <button key={item.path} type="button" onClick={() => reLaunchTo(item.path)} className="s-bottom-nav__item">
              <Icon size={24} className={`s-bottom-nav__icon${isActive ? ` s-bottom-nav__icon--active` : ``}`} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`s-bottom-nav__label${isActive ? ` s-bottom-nav__label--active` : ``}`}>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
