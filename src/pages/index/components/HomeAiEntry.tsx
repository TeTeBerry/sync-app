import './HomeAiEntry.scss';
import type { FC } from 'react';
import { Bot, ChevronRight } from '../../../components/icons';
import { AI_ASSISTANT_DISCLAIMER } from '../../../constants/aiDisclosure';
import { goPrepTab } from '../../../utils/route';
import { getActiveActivityLegacyId } from '@/domains/activity-scope';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export const HomeAiEntry: FC = () => {
  const t = useT();
  return (
    <View className="s-home-ai" aria-label={t('home.aiEntryTitle')}>
      <View className="s-home-ai__head">
        <Text className="s-home-ai__title">{t('home.aiEntryTitle')}</Text>
        <Text className="s-home-ai__badge">{t('home.aiEntryBadge')}</Text>
      </View>

      <View
        className="s-home-ai__card"
        onClick={() => goPrepTab(getActiveActivityLegacyId() ?? undefined)}
        role="button"
        aria-label={t('home.aiEntryTitle')}
      >
        <View className="s-home-ai__card-glow" aria-hidden />

        <View className="s-home-ai__card-top">
          <View className="s-home-ai__icon-wrap" aria-hidden>
            <Bot size={22} color="#4cc9f0" />
          </View>
          <View className="s-home-ai__copy">
            <Text className="s-home-ai__card-title">{t('home.aiEntryCardTitle')}</Text>
            <Text className="s-home-ai__card-desc">{t('home.aiEntryCardDesc')}</Text>
          </View>
        </View>

        <View className="s-home-ai__footer">
          <Text className="s-home-ai__meta">{AI_ASSISTANT_DISCLAIMER}</Text>
          <View className="s-home-ai__cta">
            <Text className="s-home-ai__cta-text">{t('home.aiEntryCta')}</Text>
            <ChevronRight size={14} color="#4cc9f0" />
          </View>
        </View>
      </View>
    </View>
  );
};
