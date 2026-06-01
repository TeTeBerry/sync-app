import { Button, cn } from '../ui';
import { Text, View } from '@tarojs/components';

const PUBLISH_CONFIRM_REPLY = '确认发布';

export function SuggestedReplyChips({
  replies,
  disabled,
  onSelect,
}: {
  replies?: string[];
  disabled?: boolean;
  onSelect: (reply: string) => void;
}) {
  if (!replies?.length) return null;

  return (
    <View className="s-ai-assistant-chat__copy-row">
      {replies.map((reply) => (
        <Button
          key={reply}
          className={cn(
            's-ai-assistant-chat__copy-chip',
            reply === PUBLISH_CONFIRM_REPLY &&
              's-ai-assistant-chat__copy-chip--primary',
          )}
          disabled={disabled}
          onClick={() => onSelect(reply)}
        >
          <Text className="s-btn-label">{reply}</Text>
        </Button>
      ))}
    </View>
  );
}
