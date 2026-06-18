import './AiTabHero.scss';
import type { FC } from 'react';
import { Sparkles } from '../../../components/icons';
import { tabPageHeaderStyle } from '../../../components/navigation/TabPageHeader';
import type { NavBarInsets } from '../../../hooks/useNavBarInsets';
import { Text, View } from '@tarojs/components';

type AiTabHeroProps = {
  navInsets: NavBarInsets;
};

export const AiTabHero: FC<AiTabHeroProps> = ({ navInsets }) => {
  const insetStyle = tabPageHeaderStyle(navInsets, { paddingRightGutterPx: 0 });

  return (
    <View className="s-ai-tab-hero" style={insetStyle}>
      <View className="s-ai-tab-hero__main">
        <View className="s-ai-tab-hero__avatar" aria-hidden>
          <Sparkles size={20} color="#ffffff" strokeWidth={2.25} />
        </View>
        <View className="s-ai-tab-hero__copy">
          <View className="s-ai-tab-hero__title-row">
            <Text className="s-ai-tab-hero__title">SYNC 助手</Text>
            <View className="s-ai-tab-hero__badge">
              <View className="s-ai-tab-hero__online-dot" aria-hidden />
              <Text className="s-ai-tab-hero__badge-text">在线</Text>
            </View>
          </View>
          <Text className="s-ai-tab-hero__tagline">出行攻略 · 组队建议 · 行程清单</Text>
        </View>
      </View>
    </View>
  );
};
