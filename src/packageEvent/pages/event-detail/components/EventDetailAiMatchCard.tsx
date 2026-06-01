import { Send, Sparkles } from 'lucide-react-taro';
import { AiGuideShortcutChip } from '../../../../components/ai-chat/AiGuideShortcutChip';
import { Button } from '../../../../components/ui';
import { Text, Textarea, View } from '@tarojs/components';
import { warmAiAssistant } from '../../../../utils/route';
import { AI_SHORTCUT_TAG_POOL } from '../../../../utils/aiShortcutTags';

const EVENT_AI_TAGS = AI_SHORTCUT_TAG_POOL;

type EventDetailAiMatchCardProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onTagClick: (tag: string) => void;
  onAiGuideClick: () => void;
};

export function EventDetailAiMatchCard({
  prompt,
  onPromptChange,
  onSubmit,
  onTagClick,
  onAiGuideClick,
}: EventDetailAiMatchCardProps) {
  const hasContent = Boolean(prompt.trim());

  return (
    <View className="s-event-detail__ai">
      <View className="s-event-detail__ai-head">
        <View className="s-event-detail__ai-head-icon-wrap" aria-hidden>
          <Sparkles size={16} className="s-event-detail__ai-head-icon" />
        </View>
        <Text className="s-event-detail__ai-head-title">告诉我你的需求 ai精准匹配</Text>
      </View>
      <View className="s-event-detail__ai-tags" onTouchStart={warmAiAssistant}>
        <AiGuideShortcutChip onTouchStart={warmAiAssistant} onClick={onAiGuideClick} />
        {EVENT_AI_TAGS.map((tag) => (
          <Button
            key={tag}
            className="s-event-detail__ai-tag"
            hoverClass="s-event-detail__ai-tag--pressed"
            onTouchStart={warmAiAssistant}
            onClick={() => onTagClick(tag)}
          >
            <Text className="s-btn-label">{tag}</Text>
          </Button>
        ))}
      </View>
      <View className="s-event-detail__ai-compose" onTouchStart={warmAiAssistant}>
        <Textarea
          className="s-event-detail__ai-compose__field"
          value={prompt}
          placeholder="告诉我你的需求..."
          placeholderClass="s-event-detail__ai-compose__placeholder"
          maxlength={200}
          autoHeight
          showConfirmBar={false}
          onInput={(e) => onPromptChange(e.detail.value)}
          onConfirm={onSubmit}
        />
        <Button
          className={[
            's-event-detail__ai-compose__send',
            hasContent
              ? 's-event-detail__ai-compose__send--active'
              : 's-event-detail__ai-compose__send--enter',
          ].join(' ')}
          aria-label={hasContent ? '发送并进入对话' : '进入 AI 对话'}
          onTouchStart={warmAiAssistant}
          onClick={onSubmit}
        >
          <Send size={18} color="#fff" aria-hidden />
        </Button>
      </View>
    </View>
  );
}
