import { Button, cn } from '../ui';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';

export function SuggestedReplyChips({
  replies,
  disabled,
  onSelect,
}: {
  replies?: string[];
  disabled?: boolean;
  onSelect: (reply: string) => void;
}) {
  const t = useT();
  const PUBLISH_CONFIRM_REPLY = t('ai.publishConfirmReply');

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
          <Text className="s-ai-assistant-chat__copy-chip-label">{reply}</Text>
          <Text className="s-ai-assistant-chat__copy-chip-arrow" aria-hidden>
            →
          </Text>
        </Button>
      ))}
    </View>
  );
}
