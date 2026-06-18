import { memo } from 'react';
import { Sparkles } from '../../components/icons';
import { cn } from '../ui';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import type { AiCapability } from '@/domains/ai-capability';
import { ChatUserAvatar } from './ChatUserAvatar';
import { ChatMessageBubble, chatMessageContentClassName } from './ChatMessageBubble';
import { ChatMessageEmbed } from './ChatMessageEmbed';
import { useChatMessageRowPresentation } from './useChatMessageRowPresentation';
import { Text, View } from '@tarojs/components';

export type ChatMessageRowProps = {
  msg: ChatUiMessage;
  prevMsg?: ChatUiMessage;
  isStreaming: boolean;
  activityLegacyId?: number;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onRunCapability?: (capability: AiCapability) => void;
  onOpenPersonalityTest?: () => void;
};

function ChatMessageRowInner({
  msg,
  prevMsg,
  isStreaming,
  activityLegacyId,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onBuddyPostFromTravelGuide,
  onRunCapability,
  onOpenPersonalityTest,
}: ChatMessageRowProps) {
  const presentation = useChatMessageRowPresentation({
    msg,
    prevMsg,
    activityLegacyId,
    onRunCapability,
    onOpenPersonalityTest,
  });
  const { isUser, timestamp, showTimestamp, showEmbedBelow } = presentation;

  return (
    <>
      {showTimestamp && timestamp ? (
        <Text className="s-ai-assistant-chat__timestamp">{timestamp}</Text>
      ) : null}
      <View
        id={`chat-msg-${msg.id}`}
        className={cn(
          's-ai-assistant-chat__row',
          isUser && 's-ai-assistant-chat__row--from-user',
        )}
      >
        {!isUser ? (
          <View className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai">
            <Sparkles size={14} />
          </View>
        ) : null}
        <View className={chatMessageContentClassName(presentation)}>
          <ChatMessageBubble
            msg={msg}
            presentation={presentation}
            isStreaming={isStreaming}
            userAvatar={userAvatar}
            userName={userName}
            userGender={userGender}
            onSelectSuggestedReply={onSelectSuggestedReply}
          />
          {showEmbedBelow ? (
            <ChatMessageEmbed
              msg={msg}
              presentation={presentation}
              isStreaming={isStreaming}
              activityLegacyId={activityLegacyId}
              onSelectSuggestedReply={onSelectSuggestedReply}
              onRegenerateTravelGuide={onRegenerateTravelGuide}
              onBuddyPostFromTravelGuide={onBuddyPostFromTravelGuide}
              onRunCapability={onRunCapability}
              onOpenPersonalityTest={onOpenPersonalityTest}
            />
          ) : null}
        </View>
        {isUser ? (
          <ChatUserAvatar avatar={userAvatar} name={userName} userGender={userGender} />
        ) : null}
      </View>
    </>
  );
}

export const ChatMessageRow = memo(ChatMessageRowInner);
