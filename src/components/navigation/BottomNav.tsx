import './BottomNav.scss';
import React from 'react';
import { useDidShow } from '@tarojs/taro';
import { Button } from '../ui';
import { View, Text } from '@tarojs/components';
import { CalendarDays, House, User } from '../../components/icons';
import {
  preloadEventSubpackage,
  preloadProfileSubpackage,
} from '../../utils/subpackagePreload';
import type { RoutePath } from '../../utils/route';
import {
  ROUTES,
  isOnTabRoot,
  switchTabTo,
  syncTabBarFromCurrentPage,
  useActiveRoutePath,
} from '../../utils/route';
import { useT } from '@/hooks/useI18n';

function preloadSubpackagesForTab(path: RoutePath) {
  if (path === ROUTES.HOME || path === ROUTES.EVENTS) {
    preloadEventSubpackage();
  }
  if (path === ROUTES.PROFILE) {
    preloadProfileSubpackage();
  }
}

function handleTabPress(path: RoutePath, isActive: boolean) {
  if (isActive && isOnTabRoot(path)) {
    return;
  }
  preloadSubpackagesForTab(path);
  switchTabTo(path);
}

const BottomNav: React.FC = () => {
  const activePath = useActiveRoutePath();
  const t = useT();

  const navItems = [
    { path: ROUTES.HOME, icon: House, label: t('tab.home') },
    { path: ROUTES.EVENTS, icon: CalendarDays, label: t('tab.events') },
    { path: ROUTES.PROFILE, icon: User, label: t('tab.profile') },
  ];

  return (
    <View data-cmp="BottomNav" className="s-bottom-nav">
      <View className="s-bottom-nav__row">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          const isTabRoot = isOnTabRoot(item.path);
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              disabled={isActive && isTabRoot}
              onTouchStart={() => {
                if (!isActive || !isTabRoot) {
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
