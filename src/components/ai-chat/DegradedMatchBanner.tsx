import { selectActiveDegraded, useAiChatStore } from '../../stores/aiChatStore';
import { Text } from '@tarojs/components';

export function DegradedMatchBanner() {
  const degraded = useAiChatStore(selectActiveDegraded);

  if (!degraded) return null;

  return (
    <Text className="s-ai-assistant-chat__degraded-banner" role="status">
      匹配结果可能不完整，已展示可用推荐
    </Text>
  );
}
