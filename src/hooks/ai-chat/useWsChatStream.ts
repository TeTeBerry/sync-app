import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import Taro from '@tarojs/taro';
import { AI_CHAT_WS_URL, isApiEnabled } from '../../constants/api';
import type {
  AiChatStreamEvent,
  ChatUiMessage,
  SendChatOptions,
} from '../../types/aiChat';
import {
  formatAiChatStreamError,
  formatAiChatToastError,
} from '../../utils/aiChatErrors';
import { buildApiChatHistory } from '../../utils/aiChatHistory';
import { buildAiChatWsSendActor } from '../../api/requestActor';
import { streamAiChatWs } from '../../utils/aiChatWs';
import { mockAiChatStream } from '../../utils/aiChatStream';
import type { TypewriterReveal } from '../../utils/typewriterReveal';
import { processChatStreamEvents } from './chatStreamReducer';

export interface UseWsChatStreamOptions {
  welcomeText: string;
  mockReply: (query: string) => string;
  streamErrorText: string;
  wsUrl?: string;
  activityLegacyIdRef: MutableRefObject<number | undefined>;
  sessionIdRef: MutableRefObject<string>;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  getAuthHeaders?: () => Record<string, string>;
  onPostCreated?: (event: Extract<AiChatStreamEvent, { type: 'post_created' }>) => void;
  onExistingPost?: (
    event: Extract<AiChatStreamEvent, { type: 'existing_post' }>,
  ) => void;
  onMatchResults?: (activityLegacyId?: number) => void | Promise<void>;
  persistSessionFromStream: (sessionId: string) => void;
  createTypewriter: (options: {
    charDelayMs?: number;
    onUpdate: (visible: string) => void;
  }) => TypewriterReveal;
  typewriterCharDelayMs?: number;
}

export function useWsChatStream(options: UseWsChatStreamOptions) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    wsUrl = AI_CHAT_WS_URL,
    activityLegacyIdRef,
    sessionIdRef,
    messagesRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    onMatchResults,
    persistSessionFromStream,
    createTypewriter,
    typewriterCharDelayMs = 22,
  } = options;

  const runStream = useCallback(
    async (payload: SendChatOptions, aiMsgId: string, abortSignal: AbortSignal) => {
      const { text, image, images } = payload;
      const trimmed = text.trim();
      const activityId = activityLegacyIdRef.current;
      const activityHeaders =
        activityId != null ? { 'X-Activity-Id': String(activityId) } : undefined;

      const pendingImage = image ?? images?.[0];
      const history = buildApiChatHistory(
        messagesRef.current,
        welcomeText,
        trimmed,
        pendingImage,
      );

      const finishAiMessage = (updater: (current: ChatUiMessage) => ChatUiMessage) => {
        setMessages((prev) =>
          prev.map((message) => (message.id === aiMsgId ? updater(message) : message)),
        );
      };

      const typewriter = createTypewriter({
        charDelayMs: typewriterCharDelayMs,
        onUpdate: (visible) => {
          finishAiMessage((message) => ({ ...message, text: visible }));
        },
      });

      try {
        const useLiveApi = Boolean(wsUrl?.trim()) && isApiEnabled();
        const stream = useLiveApi
          ? streamAiChatWs({
              url: wsUrl,
              messages: history,
              sessionId: sessionIdRef.current,
              ...buildAiChatWsSendActor(),
              activityLegacyId: activityId,
              image: pendingImage,
              images,
              signal: abortSignal,
              headers: {
                ...activityHeaders,
                ...getAuthHeaders?.(),
              },
            })
          : mockAiChatStream(mockReply(trimmed));

        await processChatStreamEvents({
          stream,
          aiMsgId,
          typewriter,
          streamErrorText,
          setMessages,
          activityLegacyId: activityId,
          persistSessionFromStream,
          onPostCreated,
          onExistingPost,
          onMatchResults,
        });
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          typewriter.stop();
          throw error;
        }

        const displayError = formatAiChatStreamError(error, streamErrorText);
        typewriter.flush();
        finishAiMessage((message) => ({
          ...message,
          text: message.text || displayError,
          streaming: false,
        }));
        void Taro.showToast({
          title: formatAiChatToastError(error, streamErrorText),
          icon: 'none',
        });
      } finally {
        finishAiMessage((message) => ({ ...message, streaming: false }));
      }
    },
    [
      activityLegacyIdRef,
      wsUrl,
      createTypewriter,
      getAuthHeaders,
      messagesRef,
      mockReply,
      onExistingPost,
      onMatchResults,
      onPostCreated,
      persistSessionFromStream,
      sessionIdRef,
      setMessages,
      streamErrorText,
      typewriterCharDelayMs,
      welcomeText,
    ],
  );

  return { runStream };
}
