import "./BottomNav.scss";
import React from "react";
import { View, Text, Button } from "@tarojs/components";
import { CalendarDays, House, User } from "lucide-react-taro";
import { ROUTES, switchTabTo, useActiveRoutePath } from "../utils/route";

const BottomNav: React.FC = () => {
  const activePath = useActiveRoutePath();

  const navItems = [
    { path: ROUTES.HOME, icon: House, label: "首页" },
    { path: ROUTES.EVENTS, icon: CalendarDays, label: "活动" },
    { path: ROUTES.PROFILE, icon: User, label: "我的" },
  ] as const;

  return (
    <View data-cmp="BottomNav" className="s-bottom-nav">
      <View className="s-bottom-nav__row">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              disabled={isActive}
              onClick={() => switchTabTo(item.path)}
              className="s-bottom-nav__item">
              <Icon
                size={24}
                color={isActive ? "#ffffff" : "#888888"}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`s-bottom-nav__icon${isActive ? " s-bottom-nav__icon--active" : ""}`}
              />
              <Text
                className={`s-bottom-nav__label${isActive ? " s-bottom-nav__label--active" : ""}`}>
                {item.label}
              </Text>
            </Button>
          );
        })}
      </View>
    </View>
  );
};

/** Renders BottomNav in a viewport-fixed host (required on WeChat tab pages). */
export function BottomNavSlot() {
  return (
    <View className="s-tabbar-fixed-host">
      <BottomNav />
    </View>
  );
}

export default BottomNav;
