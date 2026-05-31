import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import Taro from "@tarojs/taro";
import { AI_CHAT_WS_URL, isApiEnabled } from "../../constants/api";
import { useAiChatStore } from "../../stores/aiChatStore";
import type { AiChatStreamEvent, ChatUiMessage, SendChatOptions } from "../../types/aiChat";
import { formatAiChatStreamError, formatAiChatToastError } from "../../utils/aiChatErrors";
import { buildApiChatHistory } from "../../utils/aiChatHistory";
import { streamAiChatWs } from "../../utils/aiChatWs";
import { mockAiChatStream } from "../../utils/aiChatStream";
import type { TypewriterReveal } from "../../utils/typewriterReveal";

export interface UseWsChatStreamOptions {
  welcomeText: string;
  mockReply: (query: string) => string;
  streamErrorText: string;
  wsUrl?: string;
  activityLegacyIdRef: MutableRefObject<number | undefined>;
  sessionIdRef: MutableRefObject<string>;
  userIdRef: MutableRefObject<string | undefined>;
  userNameRef: MutableRefObject<string | undefined>;
  userPhoneRef: MutableRefObject<string | undefined>;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  getAuthHeaders?: () => Record<string, string>;
  onPostCreated?: (event: Extract<AiChatStreamEvent, { type: "post_created" }>) => void;
  onExistingPost?: (event: Extract<AiChatStreamEvent, { type: "existing_post" }>) => void;
  onMatchTurnComplete?: () => void | Promise<void>;
  persistSessionFromStream: (sessionId: string) => void;
  createTypewriter: (options: {
    charDelayMs?: number;
    onUpdate: (visible: string) => void;
  }) => TypewriterReveal;
  typewriterCharDelayMs?: number;
}

function applyStreamEventToStore(event: AiChatStreamEvent) {
  const store = useAiChatStore.getState();

  if (event.type === "conversation_patch") {
    store.applyConversationPatch(event.state);
    return;
  }

  if (event.type === "suggested_replies") {
    store.setSuggestedReplies(event.replies);
    return;
  }

  if (event.type === "post_recommendations") {
    store.setPostRecommendationsMeta(event.degraded);
  }
}

export function useWsChatStream(options: UseWsChatStreamOptions) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    wsUrl = AI_CHAT_WS_URL,
    activityLegacyIdRef,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    messagesRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    onMatchTurnComplete,
    persistSessionFromStream,
    createTypewriter,
    typewriterCharDelayMs = 22,
  } = options;

  const processStreamEvents = useCallback(
    async (
      stream: AsyncGenerator<AiChatStreamEvent>,
      aiMsgId: string,
      typewriter: TypewriterReveal,
    ) => {
      const finishAiMessage = (updater: (current: ChatUiMessage) => ChatUiMessage) => {
        setMessages((prev) =>
          prev.map((message) => (message.id === aiMsgId ? updater(message) : message)),
        );
      };

      for await (const event of stream) {
        applyStreamEventToStore(event);

        if (event.type === "delta") {
          typewriter.append(event.content);
          continue;
        }

        if (event.type === "message_complete") {
          if (!typewriter.getTarget()) {
            typewriter.append(event.content);
          } else {
            typewriter.ensureTarget(event.content);
          }
          continue;
        }

        if (event.type === "post_created") {
          onPostCreated?.(event);
          if (event.post) {
            finishAiMessage((message) => ({
              ...message,
              createdPost: event.post,
            }));
          }
          continue;
        }

        if (event.type === "existing_post") {
          onExistingPost?.(event);
          continue;
        }

        if (event.type === "post_recommendations") {
          finishAiMessage((message) => ({
            ...message,
            recommendedPosts: event.posts,
          }));
          continue;
        }

        if (event.type === "activity_recommendation") {
          finishAiMessage((message) => ({
            ...message,
            recommendedActivity: event.activity,
          }));
          continue;
        }

        if (event.type === "suggested_replies") {
          finishAiMessage((message) => ({
            ...message,
            suggestedReplies: event.replies,
          }));
          continue;
        }

        if (event.type === "conversation_patch") {
          continue;
        }

        if (event.type === "error") {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[AI chat] stream error:", event.message);
          }
          typewriter.flush();
          finishAiMessage((message) => ({
            ...message,
            text: event.message || message.text || streamErrorText,
            streaming: false,
          }));
          void Taro.showToast({
            title: formatAiChatToastError(new Error(event.message), streamErrorText),
            icon: "none",
          });
          break;
        }

        if (event.type === "done") {
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
          await onMatchTurnComplete?.();
          break;
        }
      }
    },
    [
      onExistingPost,
      onMatchTurnComplete,
      onPostCreated,
      persistSessionFromStream,
      setMessages,
      streamErrorText,
    ],
  );

  const runStream = useCallback(
    async (payload: SendChatOptions, aiMsgId: string, abortSignal: AbortSignal) => {
      const { text, image, images } = payload;
      const trimmed = text.trim();
      const activityId = activityLegacyIdRef.current;
      const activityHeaders =
        activityId != null ? { "X-Activity-Id": String(activityId) } : undefined;

      const pendingImage = image ?? images?.[0];
      const history = buildApiChatHistory(messagesRef.current, welcomeText, trimmed, pendingImage);

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
              userId: userIdRef.current,
              userName: userNameRef.current,
              userPhone: userPhoneRef.current,
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

        await processStreamEvents(stream, aiMsgId, typewriter);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
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
          icon: "none",
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
      processStreamEvents,
      sessionIdRef,
      streamErrorText,
      typewriterCharDelayMs,
      userIdRef,
      userNameRef,
      userPhoneRef,
      welcomeText,
    ],
  );

  return { runStream };
}
