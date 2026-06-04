import './AiDisclosure.scss';
import { Sparkles } from '../../components/icons';
import { AI_RECOMMEND_LABEL } from '../../constants/aiDisclosure';
import { Text, View } from '@tarojs/components';

export function AiRecommendBadge() {
  return (
    <View className="s-ai-disclosure-badge s-ai-disclosure-badge--recommend">
      <Sparkles size={10} color="#ff0066" />
      <Text className="s-ai-disclosure-badge__text">{AI_RECOMMEND_LABEL}</Text>
    </View>
  );
}
