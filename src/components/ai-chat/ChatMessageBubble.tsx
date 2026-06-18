import { cn } from '../ui';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import { PublishConfirmCard } from './PublishConfirmCard';
import { SuggestedReplyChips } from './SuggestedReplyChips';
import { AiChatProgressIndicator } from './AiChatProgressIndicator';
import type { ChatMessageRowPresentation } from './useChatMessageRowPresentation';
import { Text, View } from '@tarojs/components';

type ChatMessageBubbleProps = {
  msg: ChatUiMessage;
  presentation: ChatMessageRowPresentation;
  isStreaming: boolean;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
  onSelectSuggestedReply: (reply: string) => void;
};

export function ChatMessageBubble({
  msg,
  presentation,
  isStreaming,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
}: ChatMessageBubbleProps) {
  const {
    isUser,
    publishConfirm,
    suggestedReplyChips,
    hasSuggestedReplyChips,
    showEmbedBelow,
    showPublishConfirm,
    showProgressIndicator,
    showTypingIndicator,
    hasSuggestedReplyChips,
  } = presentation;

  return (
    <View
      className={cn(
        's-ai-assistant-chat__bubble',
        isUser
          ? cn(
              's-ai-assistant-chat__bubble--from-user',
              userGender === 'female' &&
                's-ai-assistant-chat__bubble--from-user--female',
              userGender === 'male' && 's-ai-assistant-chat__bubble--from-user--male',
            )
          : 's-ai-assistant-chat__bubble--from-ai',
        msg.streaming && 's-ai-assistant-chat__bubble--streaming',
        msg.streaming &&
          (showProgressIndicator || showTypingIndicator) &&
          's-ai-assistant-chat__bubble--waiting',
        showEmbedBelow && 's-ai-assistant-chat__bubble--with-embed-below',
        showPublishConfirm && 's-ai-assistant-chat__bubble--publish-confirm',
      )}
    >
      {showProgressIndicator && msg.progressKind ? (
        <AiChatProgressIndicator kind={msg.progressKind} label={msg.text} />
      ) : showTypingIndicator ? (
        <View className="s-ai-assistant-chat__typing" aria-label="AI 正在思考">
          <View className="s-ai-assistant-chat__typing-dot" />
          <View className="s-ai-assistant-chat__typing-dot" />
          <View className="s-ai-assistant-chat__typing-dot" />
        </View>
      ) : (
        <>
          {publishConfirm ? (
            <PublishConfirmCard
              payload={publishConfirm}
              userAvatar={userAvatar}
              userName={userName}
            />
          ) : msg.text ? (
            <Text className="s-ai-assistant-chat__bubble-text">{msg.text}</Text>
          ) : null}
          {isUser && hasSuggestedReplyChips ? (
            <SuggestedReplyChips
              replies={suggestedReplyChips}
              disabled={isStreaming}
              onSelect={onSelectSuggestedReply}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

export function chatMessageContentClassName(
  presentation: ChatMessageRowPresentation,
): string {
  const { isUser, hasPostCards, hasActivityCard, showPublishConfirm } = presentation;
  return cn(
    's-ai-assistant-chat__content',
    isUser && 's-ai-assistant-chat__content--from-user',
    (hasPostCards || hasActivityCard || showPublishConfirm) &&
      's-ai-assistant-chat__content--has-cards',
  );
}
