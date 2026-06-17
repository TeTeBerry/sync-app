import { Text, View } from '@tarojs/components';
import type { AiChatProgressKind } from '../../constants/aiChatProgress';
import { getAiChatProgressLabel } from '../../constants/aiChatProgress';

export function AiChatProgressIndicator({
  kind,
  label,
}: {
  kind: AiChatProgressKind;
  label?: string;
}) {
  const displayLabel = label?.trim() || getAiChatProgressLabel(kind);

  return (
    <View className="s-ai-assistant-chat__progress" aria-label={displayLabel}>
      <View className="s-ai-assistant-chat__typing" aria-hidden>
        <View className="s-ai-assistant-chat__typing-dot" />
        <View className="s-ai-assistant-chat__typing-dot" />
        <View className="s-ai-assistant-chat__typing-dot" />
      </View>
      <Text className="s-ai-assistant-chat__progress-label">{displayLabel}</Text>
    </View>
  );
}
