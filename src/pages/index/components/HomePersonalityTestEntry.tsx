import './HomePersonalityTestEntry.scss';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { AudioWaveform, ChevronRight } from '../../../components/icons';
import { resolvePersonalityTestSoulDjName } from '@/domains/personality-test';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { goPersonalityTest } from '../../../utils/route';
import { Text, View } from '@tarojs/components';

const GENRE_TAGS = ['Techno', 'House', 'Trance', 'Bass'] as const;

export const HomePersonalityTestEntry: FC = () => {
  const { loggedIn } = useAuthSession();
  const [cachedSoulDj, setCachedSoulDj] = useState<string | null>(null);

  const refreshEntry = useCallback(async () => {
    const soulDj = await resolvePersonalityTestSoulDjName();
    setCachedSoulDj(soulDj);
  }, []);

  useEffect(() => {
    void refreshEntry();
  }, [loggedIn, refreshEntry]);

  useDidShow(() => {
    void refreshEntry();
  });

  const handleStart = () => {
    goPersonalityTest({ viewResult: Boolean(cachedSoulDj) });
  };

  return (
    <View className="s-home-personality" aria-label="电音人格测试">
      <View className="s-home-personality__head">
        <Text className="s-home-personality__title">电音人格测试</Text>
        <Text className="s-home-personality__badge">测完可分享</Text>
      </View>

      <View
        className="s-home-personality__card"
        onClick={handleStart}
        role="button"
        aria-label={cachedSoulDj ? '查看电音人格测试结果' : '开始电音人格测试'}
      >
        <View className="s-home-personality__card-glow" aria-hidden />

        <View className="s-home-personality__card-top">
          <View className="s-home-personality__icon-wrap" aria-hidden>
            <AudioWaveform size={22} color="#ff0066" />
          </View>
          <View className="s-home-personality__copy">
            <Text className="s-home-personality__card-title">
              {cachedSoulDj ? `本命 DJ：${cachedSoulDj}` : '你是哪种 Raver？'}
            </Text>
            <Text className="s-home-personality__card-desc">
              {cachedSoulDj
                ? '点击查看完整解读，生成海报分享给好友'
                : '8 道场景题匹配本命 DJ，生成专属海报分享给同好。'}
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
            {cachedSoulDj ? '结果已保存 · 可再测分享' : '约 3 分钟 · 无需登录'}
          </Text>
          <View className="s-home-personality__cta">
            <Text className="s-home-personality__cta-text">
              {cachedSoulDj ? '查看结果' : '开始测试'}
            </Text>
            <ChevronRight size={14} color="#ff0066" />
          </View>
        </View>
      </View>
    </View>
  );
};
