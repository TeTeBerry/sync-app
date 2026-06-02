import type { Dispatch, SetStateAction } from 'react';
import Taro from '@tarojs/taro';
import type { AiChatStreamEvent, ChatUiMessage } from '../../types/aiChat';
import { formatAiChatToastError } from '../../utils/aiChatErrors';
import { handleApiUnauthorized } from '../../api/handleApiUnauthorized';
import { closeAiChatWsConnection } from '../../utils/aiChatWs';
import { shouldClearSessionOnWsError } from '../../utils/wsAuthError';
import type { TypewriterReveal } from '../../utils/typewriterReveal';
import { patchChatMessage } from '../../utils/chatMessages';
import { applyStreamEventToSessionStore } from './useChatStreamStoreSync';

export interface ProcessChatStreamEventsOptions {
  stream: AsyncGenerator<AiChatStreamEvent>;
  aiMsgId: string;
  typewriter: TypewriterReveal;
  streamErrorText: string;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  activityLegacyId?: number;
  persistSessionFromStream: (sessionId: string) => void;
  onTurnPersisted?: () => void;
  onPostCreated?: (event: Extract<AiChatStreamEvent, { type: 'post_created' }>) => void;
  onExistingPost?: (
    event: Extract<AiChatStreamEvent, { type: 'existing_post' }>,
  ) => void;
  onMatchResults?: (activityLegacyId?: number) => void | Promise<void>;
}

export async function processChatStreamEvents(
  options: ProcessChatStreamEventsOptions,
): Promise<void> {
  const {
    stream,
    aiMsgId,
    typewriter,
    streamErrorText,
    setMessages,
    activityLegacyId,
    persistSessionFromStream,
    onPostCreated,
    onExistingPost,
    onMatchResults,
  } = options;

  const finishAiMessage = (updater: (current: ChatUiMessage) => ChatUiMessage) => {
    setMessages((prev) =>
      patchChatMessage(prev, aiMsgId, (message) => {
        const next = updater(message);
        return next === message ? message : next;
      }),
    );
  };

  for await (const event of stream) {
    applyStreamEventToSessionStore(event);

    if (event.type === 'delta') {
      typewriter.append(event.content);
      continue;
    }

    if (event.type === 'message_complete') {
      if (!typewriter.getTarget()) {
        typewriter.append(event.content);
      } else {
        typewriter.ensureTarget(event.content);
      }
      continue;
    }

    if (event.type === 'post_created') {
      onPostCreated?.(event);
      if (event.post) {
        finishAiMessage((message) => ({
          ...message,
          createdPost: event.post,
        }));
      }
      continue;
    }

    if (event.type === 'existing_post') {
      onExistingPost?.(event);
      continue;
    }

    if (event.type === 'post_recommendations') {
      finishAiMessage((message) => ({
        ...message,
        recommendedPosts: event.posts,
      }));
      if (event.posts.length > 0) {
        void onMatchResults?.(activityLegacyId);
      }
      continue;
    }

    if (event.type === 'activity_recommendation') {
      finishAiMessage((message) => ({
        ...message,
        recommendedActivity: event.activity,
      }));
      continue;
    }

    if (event.type === 'suggested_replies') {
      finishAiMessage((message) => ({
        ...message,
        suggestedReplies: event.replies,
      }));
      continue;
    }

    if (event.type === 'conversation_patch') {
      continue;
    }

    if (event.type === 'error') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AI chat] stream error:', event.message);
      }
      if (shouldClearSessionOnWsError(event.message)) {
        closeAiChatWsConnection('session expired');
        handleApiUnauthorized(event.message);
      }
      typewriter.flush();
      finishAiMessage((message) => ({
        ...message,
        text: event.message || message.text || streamErrorText,
        streaming: false,
      }));
      void Taro.showToast({
        title: formatAiChatToastError(new Error(event.message), streamErrorText),
        icon: 'none',
      });
      break;
    }

    if (event.type === 'done') {
      finishAiMessage((message) => ({
        ...message,
        streaming: false,
      }));
      await typewriter.waitUntilComplete();
      finishAiMessage((message) => ({
        ...message,
        text: typewriter.getTarget() || message.text,
        streaming: false,
      }));
      if (event.sessionId) {
        persistSessionFromStream(event.sessionId);
      }
      onTurnPersisted?.();
      break;
    }
  }
}
