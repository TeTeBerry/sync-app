import { Button, cn } from "../ui";
import { useAiChatStore } from "../../stores/aiChatStore";

const PUBLISH_CONFIRM_REPLY = "确认发布";

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
          className={cn(
            "s-ai-assistant-chat__copy-chip",
            reply === PUBLISH_CONFIRM_REPLY &&
              "s-ai-assistant-chat__copy-chip--primary",
          )}
          disabled={disabled}
          onClick={() => onSelect(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
