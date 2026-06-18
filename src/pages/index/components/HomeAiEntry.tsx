import './HomeAiEntry.scss';
import type { FC } from 'react';
import { Bot, ChevronRight } from '../../../components/icons';
import { AI_ASSISTANT_DISCLAIMER } from '../../../constants/aiDisclosure';
import { switchTabTo, ROUTES } from '../../../utils/route';
import { Text, View } from '@tarojs/components';

export const HomeAiEntry: FC = () => (
  <View className="s-home-ai" aria-label="AI 出行助手">
    <View className="s-home-ai__head">
      <Text className="s-home-ai__title">AI 出行助手</Text>
      <Text className="s-home-ai__badge">免费工具</Text>
    </View>

    <View
      className="s-home-ai__card"
      onClick={() => switchTabTo(ROUTES.AI)}
      role="button"
      aria-label="打开 AI 助手"
    >
      <View className="s-home-ai__card-glow" aria-hidden />

      <View className="s-home-ai__card-top">
        <View className="s-home-ai__icon-wrap" aria-hidden>
          <Bot size={22} color="#4cc9f0" />
        </View>
        <View className="s-home-ai__copy">
          <Text className="s-home-ai__card-title">问行程、查攻略、做 checklist</Text>
          <Text className="s-home-ai__card-desc">
            绑定活动后，可生成出行建议与待办清单，帮你更快做好准备。
          </Text>
        </View>
      </View>

      <View className="s-home-ai__footer">
        <Text className="s-home-ai__meta">{AI_ASSISTANT_DISCLAIMER}</Text>
        <View className="s-home-ai__cta">
          <Text className="s-home-ai__cta-text">去问问</Text>
          <ChevronRight size={14} color="#4cc9f0" />
        </View>
      </View>
    </View>
  </View>
);
