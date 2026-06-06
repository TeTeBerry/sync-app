import './ExploreFeedTabs.scss';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import type { ExploreFeedTab } from './useExploreFeedPage';

const TABS: Array<{ key: ExploreFeedTab; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'hot', label: '热门' },
  { key: 'nearby', label: '附近' },
  { key: 'following', label: '关注' },
];

type ExploreFeedTabsProps = {
  activeTab: ExploreFeedTab;
  onChange: (tab: ExploreFeedTab) => void;
};

export const ExploreFeedTabs: FC<ExploreFeedTabsProps> = ({ activeTab, onChange }) => {
  return (
    <View className="s-explore-tabs">
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <View
            key={tab.key}
            className={[
              's-explore-tabs__item',
              active && 's-explore-tabs__item--active',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(tab.key)}
            role="button"
            aria-label={tab.label}
          >
            <Text className="s-explore-tabs__label">{tab.label}</Text>
          </View>
        );
      })}
    </View>
  );
};
