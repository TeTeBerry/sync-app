import { Send, Sparkles } from "lucide-react-taro";
import { Button, Text, Textarea, View } from "@tarojs/components";
import { AI_SHORTCUT_TAG_POOL } from "../../../../utils/aiShortcutTags";

const EVENT_AI_TAGS = AI_SHORTCUT_TAG_POOL;

type EventDetailAiMatchCardProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onTagClick: (tag: string) => void;
};

export function EventDetailAiMatchCard({
  prompt,
  onPromptChange,
  onSubmit,
  onTagClick,
}: EventDetailAiMatchCardProps) {
  const canSend = Boolean(prompt.trim());

  return (
    <View className="s-event-detail__ai">
      <View className="s-event-detail__ai-head">
        <View className="s-event-detail__ai-head-icon-wrap" aria-hidden>
          <Sparkles size={16} className="s-event-detail__ai-head-icon" />
        </View>
        <Text className="s-event-detail__ai-head-title">告诉我你的需求 ai精准匹配</Text>
      </View>
      <View className="s-event-detail__ai-tags">
        {EVENT_AI_TAGS.map((tag) => (
          <Button
            key={tag}
            className="s-event-detail__ai-tag"
            hoverClass="s-event-detail__ai-tag--pressed"
            onClick={() => onTagClick(tag)}>
            <Text className="s-btn-label">{tag}</Text>
          </Button>
        ))}
      </View>
      <View className="s-event-detail__ai-compose">
        <Textarea
          className="s-event-detail__ai-compose__field"
          value={prompt}
          placeholder="告诉我你的需求..."
          placeholderClass="s-event-detail__ai-compose__placeholder"
          maxlength={200}
          autoHeight
          showConfirmBar={false}
          onInput={(e) => onPromptChange(e.detail.value)}
          onConfirm={() => {
            if (canSend) onSubmit();
          }}
        />
        <Button
          className={[
            "s-event-detail__ai-compose__send",
            !canSend && "s-event-detail__ai-compose__send--disabled",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="发送"
          disabled={!canSend}
          onClick={onSubmit}>
          <Send size={18} color="#fff" aria-hidden />
        </Button>
      </View>
    </View>
  );
}
