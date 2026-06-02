import './AiMatchQuotaExhaustedMessage.scss';
import { Sparkles, Zap } from '../../components/icons';
import { Text, View } from '@tarojs/components';
import { useAiMatchQuota } from '../../hooks/useAiMatchQuota';

export function AiMatchQuotaExhaustedMessage() {
  const { exhausted, usageLabel, loading } = useAiMatchQuota();

  if (loading || !exhausted) return null;

  return (
    <View className="s-ai-assistant-chat__row" role="status">
      <View className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai">
        <Sparkles size={14} />
      </View>
      <View className="s-ai-assistant-chat__content">
        <View className="s-ai-match-quota-msg">
          <View className="s-ai-match-quota-msg__head">
            <Zap size={16} className="s-ai-match-quota-msg__icon" aria-hidden />
            <Text className="s-ai-match-quota-msg__text">
              你的 AI 匹配次数已用完 ({usageLabel})，升级套餐后可继续使用。
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
