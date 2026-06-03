import './BottomNav.scss';
import React from 'react';
import { Button } from '../ui';
import { View, Text } from '@tarojs/components';
import { CalendarDays, House, MessageCircle, User } from '../../components/icons';
import {
  preloadAiSubpackage,
  preloadEventSubpackage,
  preloadMessageSubpackage,
  preloadProfileSubpackage,
} from '../../utils/subpackagePreload';
import type { RoutePath } from '../../utils/route';
import { ROUTES, goMessages, switchTabTo, useActiveRoutePath } from '../../utils/route';

function preloadSubpackagesForTab(path: RoutePath) {
  if (path === ROUTES.HOME || path === ROUTES.EVENTS) {
    preloadEventSubpackage();
    return;
  }
  if (path === ROUTES.PROFILE) {
    preloadProfileSubpackage();
    preloadAiSubpackage();
  }
}

function isMessagesRouteActive(activePath: string): boolean {
  return activePath === ROUTES.MESSAGES || activePath.startsWith('/packageMessage/');
}

const BottomNav: React.FC = () => {
  const activePath = useActiveRoutePath();

  const navItems = [
    { path: ROUTES.HOME, icon: House, label: '首页', kind: 'tab' as const },
    { path: ROUTES.EVENTS, icon: CalendarDays, label: '活动', kind: 'tab' as const },
    {
      path: ROUTES.MESSAGES,
      icon: MessageCircle,
      label: '私信',
      kind: 'stack' as const,
    },
    { path: ROUTES.PROFILE, icon: User, label: '我的', kind: 'tab' as const },
  ];

  return (
    <View data-cmp="BottomNav" className="s-bottom-nav">
      <View className="s-bottom-nav__row">
        {navItems.map((item) => {
          const isActive =
            item.kind === 'stack'
              ? isMessagesRouteActive(activePath)
              : activePath === item.path;
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              disabled={isActive}
              onTouchStart={() => {
                if (!isActive) {
                  if (item.kind === 'stack') {
                    preloadMessageSubpackage();
                  } else {
                    preloadSubpackagesForTab(item.path);
                  }
                }
              }}
              onClick={() => {
                if (item.kind === 'stack') {
                  goMessages();
                  return;
                }
                switchTabTo(item.path);
              }}
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

/** Renders BottomNav in a viewport-fixed host (required on WeChat tab pages). */
export function BottomNavSlot() {
  return (
    <View className="s-tabbar-fixed-host">
      <BottomNav />
    </View>
  );
}

export default BottomNav;
