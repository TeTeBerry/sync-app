import './BottomNav.scss';
import React from 'react';
import { useDidShow } from '@tarojs/taro';
import { Button } from '../ui';
import { View, Text } from '@tarojs/components';
import { Bot, CalendarDays, House, User } from '../../components/icons';
import {
  preloadAiSubpackage,
  preloadEventSubpackage,
  preloadProfileSubpackage,
} from '../../utils/subpackagePreload';
import type { RoutePath } from '../../utils/route';
import {
  ROUTES,
  switchTabTo,
  syncTabBarFromCurrentPage,
  useActiveRoutePath,
} from '../../utils/route';

function preloadSubpackagesForTab(path: RoutePath) {
  if (path === ROUTES.HOME || path === ROUTES.EVENTS || path === ROUTES.AI) {
    preloadEventSubpackage();
  }
  if (path === ROUTES.AI) {
    preloadAiSubpackage();
  }
  if (path === ROUTES.PROFILE) {
    preloadProfileSubpackage();
  }
}

function handleTabPress(path: RoutePath, isActive: boolean) {
  if (isActive) return;
  preloadSubpackagesForTab(path);
  switchTabTo(path);
}

const BottomNav: React.FC = () => {
  const activePath = useActiveRoutePath();

  const navItems = [
    { path: ROUTES.HOME, icon: House, label: '首页' },
    { path: ROUTES.AI, icon: Bot, label: 'AI助手' },
    { path: ROUTES.EVENTS, icon: CalendarDays, label: '活动' },
    { path: ROUTES.PROFILE, icon: User, label: '我的' },
  ];

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
              onTouchStart={() => {
                if (!isActive) {
                  preloadSubpackagesForTab(item.path);
                }
              }}
              onClick={() => handleTabPress(item.path, isActive)}
              className="s-bottom-nav__item"
            >
              <Icon
                size={24}
                color={isActive ? '#ffffff' : '#888888'}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`s-bottom-nav__icon${isActive ? ' s-bottom-nav__icon--active' : ''}`}
              />
              <Text
                className={`s-bottom-nav__label${isActive ? ' s-bottom-nav__label--active' : ''}`}
              >
                {item.label}
              </Text>
            </Button>
          );
        })}
      </View>
    </View>
  );
};

/** Fixed bottom tab bar only (used by WeChat custom-tab-bar). */
export function BottomNavSlot() {
  return (
    <View className="s-tabbar-fixed-host">
      <BottomNav />
    </View>
  );
}

/** Tab bar for stack pages that embed the bar in-page. */
export function PageTabBarChrome() {
  useDidShow(() => {
    syncTabBarFromCurrentPage();
  });
  return <BottomNavSlot />;
}

export default BottomNav;
