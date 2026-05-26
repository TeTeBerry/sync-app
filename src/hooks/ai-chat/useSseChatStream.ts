import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { AI_CHAT_STREAM_URL } from "../../constants/api";
import { useAiChatStore } from "../../stores/aiChatStore";
import type {
  AiChatStreamEvent,
  ChatUiMessage,
  SendChatOptions,
} from "../../types/aiChat";
import { buildApiChatHistory } from "../../utils/aiChatHistory";
import { mockAiChatStream, streamAiChatRequest } from "../../utils/aiChatStream";
import type { TypewriterReveal } from "../../utils/typewriterReveal";
import { createMessageId } from "./createMessageId";

export interface UseSseChatStreamOptions {
  welcomeText: string;
  mockReply: (query: string) => string;
  streamErrorText: string;
  apiUrl?: string;
  activityLegacyIdRef: MutableRefObject<number | undefined>;
  sessionIdRef: MutableRefObject<string>;
  userIdRef: MutableRefObject<string | undefined>;
  userNameRef: MutableRefObject<string | undefined>;
  userPhoneRef: MutableRefObject<string | undefined>;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  getAuthHeaders?: () => Record<string, string>;
  onPostCreated?: (
    event: Extract<AiChatStreamEvent, { type: "post_created" }>,
  ) => void;
  onExistingPost?: (
    event: Extract<AiChatStreamEvent, { type: "existing_post" }>,
  ) => void;
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

export function useSseChatStream(options: UseSseChatStreamOptions) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl = AI_CHAT_STREAM_URL,
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
      const finishAiMessage = (
        updater: (current: ChatUiMessage) => ChatUiMessage,
      ) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiMsgId ? updater(message) : message,
          ),
        );
      };

      for await (const event of stream) {
        applyStreamEventToStore(event);

        if (event.type === "delta") {
          typewriter.append(event.content);
          continue;
        }

        if (event.type === "message_complete") {
          typewriter.setFullText(event.content);
          continue;
        }

        if (event.type === "post_created") {
          onPostCreated?.(event);
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

        if (event.type === "buddy_copy_variants") {
          finishAiMessage((message) => ({
            ...message,
            copyVariants: event.variants,
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
          typewriter.flush();
          finishAiMessage((message) => ({
            ...message,
            text: message.text || event.message,
            streaming: false,
          }));
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
          break;
        }
      }
    },
    [
      onExistingPost,
      onPostCreated,
      persistSessionFromStream,
      setMessages,
    ],
  );

  const runStream = useCallback(
    async (
      payload: SendChatOptions,
      aiMsgId: string,
      abortSignal: AbortSignal,
    ) => {
      const { text, image } = payload;
      const trimmed = text.trim();
      const activityId = activityLegacyIdRef.current;
      const activityHeaders =
        activityId != null
          ? { "X-Activity-Id": String(activityId) }
          : undefined;

      const history = buildApiChatHistory(
        messagesRef.current,
        welcomeText,
        trimmed,
        image,
      );

      const finishAiMessage = (
        updater: (current: ChatUiMessage) => ChatUiMessage,
      ) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiMsgId ? updater(message) : message,
          ),
        );
      };

      const typewriter = createTypewriter({
        charDelayMs: typewriterCharDelayMs,
        onUpdate: (visible) => {
          finishAiMessage((message) => ({ ...message, text: visible }));
        },
      });

      try {
        const stream = apiUrl
          ? streamAiChatRequest({
              url: apiUrl,
              messages: history,
              sessionId: sessionIdRef.current,
              userId: userIdRef.current,
              userName: userNameRef.current,
              userPhone: userPhoneRef.current,
              activityLegacyId: activityId,
              image,
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

        typewriter.flush();
        finishAiMessage((message) => ({
          ...message,
          text: message.text || streamErrorText,
          streaming: false,
        }));
      } finally {
        finishAiMessage((message) => ({ ...message, streaming: false }));
      }
    },
    [
      activityLegacyIdRef,
      apiUrl,
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
