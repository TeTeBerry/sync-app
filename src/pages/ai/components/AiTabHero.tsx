import './AiTabHero.scss';
import type { FC } from 'react';
import { Sparkles } from '../../../components/icons';
import { tabPageHeaderStyle } from '../../../components/navigation/TabPageHeader';
import type { NavBarInsets } from '../../../hooks/useNavBarInsets';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type AiTabHeroProps = {
  navInsets: NavBarInsets;
};

export const AiTabHero: FC<AiTabHeroProps> = ({ navInsets }) => {
  const insetStyle = tabPageHeaderStyle(navInsets, { paddingRightGutterPx: 0 });
  const t = useT();

  return (
    <View className="s-ai-tab-hero" style={insetStyle}>
      <View className="s-ai-tab-hero__main">
        <View className="s-ai-tab-hero__avatar" aria-hidden>
          <Sparkles size={20} color="#ffffff" strokeWidth={2.25} />
        </View>
        <View className="s-ai-tab-hero__copy">
          <View className="s-ai-tab-hero__title-row">
            <Text className="s-ai-tab-hero__title">{t('ai.assistantTitle')}</Text>
            <View className="s-ai-tab-hero__badge">
              <View className="s-ai-tab-hero__online-dot" aria-hidden />
              <Text className="s-ai-tab-hero__badge-text">
                {t('ai.assistantOnline')}
              </Text>
            </View>
          </View>
          <Text className="s-ai-tab-hero__tagline">{t('ai.assistantTagline')}</Text>
        </View>
      </View>
    </View>
  );
};
