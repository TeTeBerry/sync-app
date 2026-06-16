import './HomePersonalityTestEntry.scss';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { AudioWaveform, ChevronRight } from '../../../components/icons';
import {
  loadPersonalityTestResult,
  restorePersonalityTestResultFromServer,
} from '@/domains/personality-test';
import { useAuthSession } from '@/hooks/useAuthSession';
import { requireAuth } from '@/utils/authGate';
import { goPersonalityTest } from '../../../utils/route';
import { Text, View } from '@tarojs/components';

const GENRE_TAGS = ['Techno', 'House', 'Trance', 'Bass'] as const;

export const HomePersonalityTestEntry: FC = () => {
  const { loggedIn } = useAuthSession();
  const [cachedSoulDj, setCachedSoulDj] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedIn) {
      setCachedSoulDj(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      let result = loadPersonalityTestResult();
      if (!result) {
        result = await restorePersonalityTestResultFromServer();
      }
      if (!cancelled) {
        setCachedSoulDj(result?.recommendations.soulMatch.djName ?? null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const handleStart = () => {
    requireAuth(() => {
      const soulDj =
        loadPersonalityTestResult()?.recommendations.soulMatch.djName ?? cachedSoulDj;
      goPersonalityTest({ viewResult: Boolean(soulDj) });
    }, 'activity');
  };

  return (
    <View className="s-home-personality" aria-label="电音人格测试">
      <View className="s-home-personality__head">
        <Text className="s-home-personality__title">电音人格测试</Text>
        <Text className="s-home-personality__badge">约 3 分钟</Text>
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
                ? '点击查看完整人格解读、阵容推荐与分享海报'
                : '8 道场景题（每次随机抽题），含听感题，再匹配本命 DJ 与适合你的电音节活动。'}
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
            {cachedSoulDj ? '结果已保存 · 可再测' : '登录后开始 · 结果可分享'}
          </Text>
          <View className="s-home-personality__cta">
            <Text className="s-home-personality__cta-text">
              {cachedSoulDj ? '查看结果' : loggedIn ? '开始测试' : '登录测试'}
            </Text>
            <ChevronRight size={14} color="#ff0066" />
          </View>
        </View>
      </View>
    </View>
  );
};
