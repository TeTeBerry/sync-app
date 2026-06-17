import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import Taro from '@tarojs/taro';
import { AI_CHAT_WS_URL, isLiveApi } from '../../constants/api';
import type {
  AiChatStreamEvent,
  ChatUiMessage,
  SendChatOptions,
} from '../../types/aiChat';
import {
  formatAiChatStreamError,
  formatAiChatToastError,
} from '../../utils/aiChatErrors';
import { buildSingleTurnUserMessage } from '../../utils/aiChatHistory';
import { buildAiChatWsSendActor } from '../../api/requestActor';
import { streamAiChatWs } from '../../utils/aiChatWs';
import type { TypewriterReveal } from '../../utils/typewriterReveal';
import { patchChatMessage } from '../../utils/chatMessages';
import { throttleRaf } from '../../utils/throttleRaf';
import { processChatStreamEvents } from './chatStreamReducer';

export interface UseWsChatStreamOptions {
  welcomeText: string;
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
  onTravelGuideReady?: (
    event: Extract<AiChatStreamEvent, { type: 'travel_guide_ready' }>,
  ) => void;
  onItineraryReady?: (
    event: Extract<AiChatStreamEvent, { type: 'itinerary_ready' }>,
  ) => void;
  persistSessionFromStream: (sessionId: string) => void;
  createTypewriter: (options: {
    charDelayMs?: number;
    onUpdate: (visible: string) => void;
  }) => TypewriterReveal;
  typewriterCharDelayMs?: number;
}

export function useWsChatStream(options: UseWsChatStreamOptions) {
  const {
    streamErrorText,
    wsUrl = AI_CHAT_WS_URL,
    activityLegacyIdRef,
    sessionIdRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    onTravelGuideReady,
    onItineraryReady,
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
      const history = buildSingleTurnUserMessage(trimmed, pendingImage);

      const finishAiMessage = (updater: (current: ChatUiMessage) => ChatUiMessage) => {
        setMessages((prev) => {
          const index = prev.findIndex((message) => message.id === aiMsgId);
          if (index < 0) return prev;
          const next = updater(prev[index]);
          if (next === prev[index]) return prev;
          const copy = prev.slice();
          copy[index] = next;
          return copy;
        });
      };

      const pushTypewriterText = throttleRaf((visible: string) => {
        setMessages((prev) =>
          patchChatMessage(prev, aiMsgId, (message) =>
            message.text === visible ? message : { ...message, text: visible },
          ),
        );
      });

      const typewriter = createTypewriter({
        charDelayMs: typewriterCharDelayMs,
        onUpdate: (visible) => {
          pushTypewriterText(visible);
        },
      });

      try {
        const wsLiveApi = Boolean(wsUrl?.trim()) && isLiveApi();
        if (!wsLiveApi) {
          void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
          finishAiMessage((message) => ({
            ...message,
            text: '当前环境未配置 AI 服务，请稍后再试。',
            streaming: false,
          }));
          return;
        }

        const stream = streamAiChatWs({
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
        });

        await processChatStreamEvents({
          stream,
          aiMsgId,
          typewriter,
          streamErrorText,
          setMessages,
          persistSessionFromStream,
          onPostCreated,
          onExistingPost,
          onTravelGuideReady,
          onItineraryReady,
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
      onExistingPost,
      onPostCreated,
      onTravelGuideReady,
      onItineraryReady,
      persistSessionFromStream,
      sessionIdRef,
      setMessages,
      streamErrorText,
      typewriterCharDelayMs,
    ],
  );

  return { runStream };
}
