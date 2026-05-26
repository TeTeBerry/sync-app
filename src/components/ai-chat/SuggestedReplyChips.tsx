import { Button } from "../ui";
import { useAiChatStore } from "../../stores/aiChatStore";

export function SuggestedReplyChips({
  replies: repliesProp,
  disabled,
  onSelect,
}: {
  replies?: string[];
  disabled?: boolean;
  onSelect: (reply: string) => void;
}) {
  const storeReplies = useAiChatStore((state) => state.suggestedReplies);
  const replies = repliesProp?.length ? repliesProp : storeReplies;

  if (!replies.length) return null;

  return (
    <div className="s-ai-assistant-chat__copy-row">
      {replies.map((reply) => (
        <Button
          key={reply}
          className="s-ai-assistant-chat__copy-chip"
          disabled={disabled}
          onClick={() => onSelect(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
