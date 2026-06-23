import './HomePersonalityTestEntry.scss';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { AudioWaveform, ChevronRight } from '../../../components/icons';
import {
  prefetchPersonalityTestAudioMedia,
  resolvePersonalityTestSoulDjName,
} from '@/domains/personality-test';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { goPersonalityTest } from '../../../utils/route';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

const GENRE_TAGS = ['Techno', 'House', 'Trance', 'Bass'] as const;

export const HomePersonalityTestEntry: FC = () => {
  const { loggedIn } = useAuthSession();
  const [cachedSoulDj, setCachedSoulDj] = useState<string | null>(null);
  const t = useT();

  const refreshEntry = useCallback(async () => {
    const soulDj = await resolvePersonalityTestSoulDjName();
    setCachedSoulDj(soulDj);
  }, []);

  useEffect(() => {
    void refreshEntry();
    prefetchPersonalityTestAudioMedia();
  }, [loggedIn, refreshEntry]);

  useDidShow(() => {
    void refreshEntry();
  });

  const handleStart = () => {
    goPersonalityTest({ viewResult: Boolean(cachedSoulDj) });
  };

  return (
    <View className="s-home-personality" aria-label={t('personality.raverPersonality')}>
      <View className="s-home-personality__head">
        <Text className="s-home-personality__title">
          {t('personality.raverPersonality')}
        </Text>
        <Text className="s-home-personality__badge">
          {t('personality.raverPersonalitySub')}
        </Text>
      </View>

      <View
        className="s-home-personality__card"
        onClick={handleStart}
        role="button"
        aria-label={
          cachedSoulDj
            ? t('personality.clickToView')
            : t('personality.raverPersonality')
        }
      >
        <View className="s-home-personality__card-glow" aria-hidden />

        <View className="s-home-personality__card-top">
          <View className="s-home-personality__icon-wrap" aria-hidden>
            <AudioWaveform size={22} color="#ff0066" />
          </View>
          <View className="s-home-personality__copy">
            <Text className="s-home-personality__card-title">
              {cachedSoulDj
                ? `${t('personality.soulDjLabel')}：${cachedSoulDj}`
                : t('personality.whichRaver')}
            </Text>
            <Text className="s-home-personality__card-desc">
              {cachedSoulDj
                ? t('personality.clickToView')
                : t('personality.raverPersonalityHint')}
            </Text>
          </View>
        </View>

        <View className="s-home-personality__tags" aria-hidden>
          {GENRE_TAGS.map((tag) => (
            <Text key={tag} className="s-home-personality__tag">
              {tag}
            </Text>
          ))}
        </View>

        <View className="s-home-personality__footer">
          <Text className="s-home-personality__meta">
            {cachedSoulDj
              ? `${t('personality.resultSaved')} · ${t('personality.retakeShare')}`
              : `${t('personality.aboutMinutes', { minutes: 3 })} · ${t('personality.noLoginNeeded')}`}
          </Text>
          <View className="s-home-personality__cta">
            <Text className="s-home-personality__cta-text">
              {cachedSoulDj ? t('personality.viewResult') : t('personality.startTest')}
            </Text>
            <ChevronRight size={14} color="#ff0066" />
          </View>
        </View>
      </View>
    </View>
  );
};
