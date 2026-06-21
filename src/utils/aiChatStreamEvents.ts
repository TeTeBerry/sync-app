import type {
  AiChatStreamEvent,
  RecommendedActivityCard,
  RecommendedPostCard,
} from '../types/aiChat';
import type { ConversationState } from '../types/conversationState';

function isRestApiEnvelope(json: Record<string, unknown>): boolean {
  return (
    typeof json.code === 'number' &&
    typeof json.message === 'string' &&
    'data' in json &&
    !('type' in json)
  );
}

function isChatSessionSnapshot(json: Record<string, unknown>): boolean {
  return (
    typeof json.sessionId === 'string' &&
    Array.isArray(json.history) &&
    !('type' in json)
  );
}

/** Parse one server stream event (WebSocket JSON frame). */
export function parseStreamEventPayload(
  json: Record<string, unknown>,
): AiChatStreamEvent | null {
  if (isRestApiEnvelope(json) || isChatSessionSnapshot(json)) {
    return null;
  }

  if (typeof json.chunk === 'string') {
    return { type: 'delta', content: json.chunk };
  }

  if (json.type === 'connected') {
    return null;
  }

  if (json.type === 'error') {
    return {
      type: 'error',
      message: String(json.message ?? 'Unknown error'),
    };
  }
  if (json.type === 'delta' && typeof json.content === 'string') {
    return { type: 'delta', content: json.content };
  }
  if (json.type === 'message_complete' && typeof json.content === 'string') {
    return {
      type: 'message_complete',
      content: json.content,
      requestId: typeof json.requestId === 'string' ? json.requestId : undefined,
    };
  }
  if (json.type === 'done') {
    return {
      type: 'done',
      messageId: json.messageId as string | undefined,
      sessionId: json.sessionId as string | undefined,
    };
  }
  if (json.type === 'post_created' && typeof json.postId === 'string') {
    const post =
      json.post && typeof json.post === 'object'
        ? (json.post as RecommendedPostCard)
        : undefined;
    return {
      type: 'post_created',
      postId: json.postId,
      activityLegacyId:
        typeof json.activityLegacyId === 'number' ? json.activityLegacyId : undefined,
      post:
        post && typeof post.postId === 'string' && typeof post.snippet === 'string'
          ? post
          : undefined,
    };
  }
  if (json.type === 'existing_post' && typeof json.postId === 'string') {
    return {
      type: 'existing_post',
      postId: json.postId,
      activityLegacyId:
        typeof json.activityLegacyId === 'number' ? json.activityLegacyId : undefined,
    };
  }
  if (
    json.type === 'activity_recommendation' &&
    json.activity &&
    typeof json.activity === 'object'
  ) {
    const activity = json.activity as RecommendedActivityCard;
    if (
      typeof activity.activityLegacyId === 'number' &&
      typeof activity.title === 'string'
    ) {
      return {
        type: 'activity_recommendation',
        activity,
      };
    }
  }
  if (json.type === 'suggested_replies' && Array.isArray(json.replies)) {
    return {
      type: 'suggested_replies',
      replies: json.replies.filter((item): item is string => typeof item === 'string'),
    };
  }
  if (json.type === 'prep_guidance') {
    return { type: 'prep_guidance' };
  }
  if (
    json.type === 'conversation_patch' &&
    json.state &&
    typeof json.state === 'object'
  ) {
    return {
      type: 'conversation_patch',
      state: json.state as ConversationState,
    };
  }
  if (json.type === 'client_action' && json.action && typeof json.action === 'object') {
    const action = json.action as { kind?: string; sheet?: string; mode?: string };
    if (
      action.kind === 'open_sheet' &&
      (action.sheet === 'buddy_post' ||
        action.sheet === 'travel_guide' ||
        action.sheet === 'itinerary' ||
        action.sheet === 'personality_test')
    ) {
      return {
        type: 'client_action',
        action: {
          kind: 'open_sheet',
          sheet: action.sheet,
          mode: action.mode === 'open' ? 'open' : 'prompt',
        },
      };
    }
  }
  if (
    json.type === 'travel_guide_job' &&
    typeof json.jobId === 'string' &&
    typeof json.guideId === 'string' &&
    typeof json.activityLegacyId === 'number' &&
    json.form &&
    typeof json.form === 'object'
  ) {
    return {
      type: 'travel_guide_job',
      jobId: json.jobId,
      guideId: json.guideId,
      activityLegacyId: json.activityLegacyId,
      form: json.form as Extract<
        AiChatStreamEvent,
        { type: 'travel_guide_job' }
      >['form'],
    };
  }
  if (
    json.type === 'travel_guide_ready' &&
    typeof json.guideId === 'string' &&
    json.plan &&
    typeof json.plan === 'object' &&
    json.form &&
    typeof json.form === 'object'
  ) {
    return {
      type: 'travel_guide_ready',
      guideId: json.guideId,
      plan: json.plan as Extract<
        AiChatStreamEvent,
        { type: 'travel_guide_ready' }
      >['plan'],
      form: json.form as Extract<
        AiChatStreamEvent,
        { type: 'travel_guide_ready' }
      >['form'],
    };
  }
  if (
    json.type === 'itinerary_ready' &&
    typeof json.itineraryId === 'string' &&
    typeof json.activityLegacyId === 'number' &&
    Array.isArray(json.selectedDjIds) &&
    Array.isArray(json.days)
  ) {
    return {
      type: 'itinerary_ready',
      itineraryId: json.itineraryId,
      activityLegacyId: json.activityLegacyId,
      selectedDjIds: json.selectedDjIds.filter(
        (id): id is string => typeof id === 'string',
      ),
      eventMeta: typeof json.eventMeta === 'string' ? json.eventMeta : '',
      days: json.days as Extract<
        AiChatStreamEvent,
        { type: 'itinerary_ready' }
      >['days'],
      conflicts: Array.isArray(json.conflicts)
        ? (json.conflicts as Extract<
            AiChatStreamEvent,
            { type: 'itinerary_ready' }
          >['conflicts'])
        : [],
      cached: typeof json.cached === 'boolean' ? json.cached : undefined,
    };
  }
  if (
    json.type === 'personality_result_ready' &&
    typeof json.resultId === 'string' &&
    json.result &&
    typeof json.result === 'object'
  ) {
    return {
      type: 'personality_result_ready',
      resultId: json.resultId,
      tagline: typeof json.tagline === 'string' ? json.tagline : '',
      primaryType: typeof json.primaryType === 'string' ? json.primaryType : '',
      soulMatchDjName:
        typeof json.soulMatchDjName === 'string' ? json.soulMatchDjName : '',
      result: json.result as Extract<
        AiChatStreamEvent,
        { type: 'personality_result_ready' }
      >['result'],
    };
  }
  if (
    json.type === 'activity_registered' &&
    typeof json.activityLegacyId === 'number'
  ) {
    return {
      type: 'activity_registered',
      activityLegacyId: json.activityLegacyId,
      title: typeof json.title === 'string' ? json.title : undefined,
      attendees: typeof json.attendees === 'number' ? json.attendees : 0,
      alreadyRegistered:
        typeof json.alreadyRegistered === 'boolean'
          ? json.alreadyRegistered
          : undefined,
    };
  }
  if (json.type === 'comment_added' && typeof json.postId === 'string') {
    return {
      type: 'comment_added',
      postId: json.postId,
      body: typeof json.body === 'string' ? json.body : '',
    };
  }
  if (typeof json.content === 'string') {
    return { type: 'delta', content: json.content };
  }
  if (typeof json.delta === 'string') {
    return { type: 'delta', content: json.delta };
  }

  return null;
}
