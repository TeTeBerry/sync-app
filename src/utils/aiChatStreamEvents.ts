import type {
  AiChatStreamEvent,
  RecommendedActivityCard,
  RecommendedPostCard,
} from "../types/aiChat";
import type { ConversationState } from "../types/conversationState";

function isRestApiEnvelope(json: Record<string, unknown>): boolean {
  return (
    typeof json.code === "number" &&
    typeof json.message === "string" &&
    "data" in json &&
    !("type" in json)
  );
}

function isChatSessionSnapshot(json: Record<string, unknown>): boolean {
  return (
    typeof json.sessionId === "string" &&
    Array.isArray(json.history) &&
    !("type" in json)
  );
}

/** Parse one server stream event (WebSocket JSON frame). */
export function parseStreamEventPayload(
  json: Record<string, unknown>,
): AiChatStreamEvent | null {
  if (isRestApiEnvelope(json) || isChatSessionSnapshot(json)) {
    return null;
  }

  if (typeof json.chunk === "string") {
    return { type: "delta", content: json.chunk };
  }

  if (json.type === "connected") {
    return null;
  }

  if (json.type === "error") {
    return {
      type: "error",
      message: String(json.message ?? "Unknown error"),
    };
  }
  if (json.type === "delta" && typeof json.content === "string") {
    return { type: "delta", content: json.content };
  }
  if (json.type === "message_complete" && typeof json.content === "string") {
    return {
      type: "message_complete",
      content: json.content,
      requestId: typeof json.requestId === "string" ? json.requestId : undefined,
    };
  }
  if (json.type === "done") {
    return {
      type: "done",
      messageId: json.messageId as string | undefined,
      sessionId: json.sessionId as string | undefined,
    };
  }
  if (json.type === "post_created" && typeof json.postId === "string") {
    const post =
      json.post && typeof json.post === "object"
        ? (json.post as RecommendedPostCard)
        : undefined;
    return {
      type: "post_created",
      postId: json.postId,
      activityLegacyId:
        typeof json.activityLegacyId === "number"
          ? json.activityLegacyId
          : undefined,
      post:
        post && typeof post.postId === "string" && typeof post.snippet === "string"
          ? post
          : undefined,
    };
  }
  if (json.type === "existing_post" && typeof json.postId === "string") {
    return {
      type: "existing_post",
      postId: json.postId,
      activityLegacyId:
        typeof json.activityLegacyId === "number"
          ? json.activityLegacyId
          : undefined,
    };
  }
  if (json.type === "post_recommendations" && Array.isArray(json.posts)) {
    return {
      type: "post_recommendations",
      posts: json.posts as RecommendedPostCard[],
      degraded: typeof json.degraded === "boolean" ? json.degraded : undefined,
    };
  }
  if (json.type === "activity_recommendation" && json.activity && typeof json.activity === "object") {
    const activity = json.activity as RecommendedActivityCard;
    if (
      typeof activity.activityLegacyId === "number" &&
      typeof activity.title === "string"
    ) {
      return {
        type: "activity_recommendation",
        activity,
      };
    }
  }
  if (json.type === "suggested_replies" && Array.isArray(json.replies)) {
    return {
      type: "suggested_replies",
      replies: json.replies.filter((item): item is string => typeof item === "string"),
    };
  }
  if (json.type === "conversation_patch" && json.state && typeof json.state === "object") {
    return {
      type: "conversation_patch",
      state: json.state as ConversationState,
    };
  }
  if (typeof json.content === "string") {
    return { type: "delta", content: json.content };
  }
  if (typeof json.delta === "string") {
    return { type: "delta", content: json.delta };
  }

  return null;
}
