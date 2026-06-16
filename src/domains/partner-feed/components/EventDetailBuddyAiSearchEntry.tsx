import { Sparkles } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailBuddyAiSearchEntryProps = {
  onClick: () => void;
};

export function EventDetailBuddyAiSearchEntry({
  onClick,
}: EventDetailBuddyAiSearchEntryProps) {
  return (
    <View className="s-event-detail-buddy-ai-search-entry">
      <Button className="s-event-detail-buddy-ai-search-entry__btn" onClick={onClick}>
        <Sparkles size={16} color="#64d2ff" aria-hidden />
        <Text className="s-event-detail-buddy-ai-search-entry__label">AI 检索搭伴</Text>
      </Button>
      <Text className="s-event-detail-buddy-ai-search-entry__hint">
        用自然语言描述需求，AI 仅解析关键词并筛选公开结伴帖
      </Text>
    </View>
  );
}
