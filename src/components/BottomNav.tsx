import "./BottomNav.scss";
import React from "react";
import { View, Text, Button } from "@tarojs/components";
import { CalendarDays, House, User } from "lucide-react-taro";
import { ROUTES, reLaunchTo, useActiveRoutePath } from "../utils/route";

const BottomNav: React.FC = () => {
  const activePath = useActiveRoutePath();

  const navItems = [
    { path: ROUTES.HOME, icon: House, label: "首页" },
    { path: ROUTES.EVENTS, icon: CalendarDays, label: "活动" },
    { path: ROUTES.PROFILE, icon: User, label: "我的" },
  ] as const;

  return (
    <View data-cmp="BottomNav" className="s-bottom-nav s-pb-safe">
      <View className="s-bottom-nav__row">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          const Icon = item.icon;
          return (
            <Button key={item.path} type="button" onClick={() => reLaunchTo(item.path)} className="s-bottom-nav__item">
              <Icon size={24} className={`s-bottom-nav__icon${isActive ? ` s-bottom-nav__icon--active` : ``}`} strokeWidth={isActive ? 2.5 : 1.5} />
              <Text className={`s-bottom-nav__label${isActive ? ` s-bottom-nav__label--active` : ``}`}>{item.label}</Text>
            </Button>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNav;
