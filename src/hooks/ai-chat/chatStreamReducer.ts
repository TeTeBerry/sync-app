import type { Dispatch, SetStateAction } from 'react';
import Taro from '@tarojs/taro';
import type { AiChatStreamEvent, ChatUiMessage } from '../../types/aiChat';
import type { TravelGuidePlan } from '../../types/travelGuide';
import type { PersonalityTestResult } from '../../domains/personality-test/types';
import { pollTravelGuideGenerationJob } from '../../api/sync/travelGuide';
import { saveTravelGuideDetail } from '../../domains/travel-guide/utils/travelGuideDetailStorage';
import { formatAiChatToastError } from '../../utils/aiChatErrors';
import { handleApiUnauthorized } from '../../api/handleApiUnauthorized';
import { closeAiChatWsConnection } from '../../utils/aiChatWs';
import { shouldClearSessionOnWsError } from '../../utils/wsAuthError';
import type { TypewriterReveal } from '../../utils/typewriterReveal';
import { patchChatMessage } from '../../utils/chatMessages';
import { clearAiChatProgress } from '../../utils/aiChatStagedProgress';
import { applyClientActionToMessage } from '../../utils/aiChatClientAction';
import { applyStreamEventToSessionStore } from './useChatStreamStoreSync';
import type { FestivalPlanTaskKey } from '../../domains/festival-plan/festivalPlanTaskDefs';
import { withPrepGuidanceChips } from '../../utils/aiPrepGuidanceChips';

export interface ProcessChatStreamEventsOptions {
  stream: AsyncGenerator<AiChatStreamEvent>;
  aiMsgId: string;
  typewriter: TypewriterReveal;
  streamErrorText: string;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  persistSessionFromStream: (sessionId: string) => void;
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
  onProgressEnd?: () => void;
  activityLegacyId?: number;
  festivalPlanNextTaskKey?: FestivalPlanTaskKey;
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
    persistSessionFromStream,
    onPostCreated,
    onExistingPost,
    onTravelGuideReady,
    onItineraryReady,
    onProgressEnd,
    activityLegacyId,
    festivalPlanNextTaskKey,
  } = options;

  const finishAiMessage = (updater: (current: ChatUiMessage) => ChatUiMessage) => {
    setMessages((prev) =>
      patchChatMessage(prev, aiMsgId, (message) => {
        const next = updater(message);
        return next === message ? message : next;
      }),
    );
  };

  const finishAiMessageWithoutProgress = (
    updater: (current: ChatUiMessage) => ChatUiMessage,
  ) => {
    onProgressEnd?.();
    finishAiMessage((message) => clearAiChatProgress(updater(message)));
  };

  for await (const event of stream) {
    applyStreamEventToSessionStore(event);

    if (event.type === 'delta') {
      onProgressEnd?.();
      typewriter.append(event.content);
      continue;
    }

    if (event.type === 'message_complete') {
      onProgressEnd?.();
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

    if (event.type === 'prep_guidance') {
      finishAiMessage((message) => ({
        ...message,
        isPrepGuidance: true,
      }));
      continue;
    }

    if (event.type === 'conversation_patch') {
      continue;
    }

    if (event.type === 'client_action') {
      finishAiMessageWithoutProgress((message) => ({
        ...message,
        ...applyClientActionToMessage(message, event.action),
      }));
      continue;
    }

    if (event.type === 'travel_guide_job') {
      onProgressEnd?.();
      finishAiMessage((message) => ({
        ...message,
        text: message.text || '正在生成出行攻略…',
        streaming: true,
        progressKind: 'travel_guide',
      }));

      try {
        const plan = await pollTravelGuideGenerationJob(event.jobId);
        saveTravelGuideDetail(event.guideId, {
          plan,
          form: event.form,
          activityLegacyId: event.activityLegacyId,
        });
        onTravelGuideReady?.({
          type: 'travel_guide_ready',
          guideId: event.guideId,
          plan: plan as unknown as Record<string, unknown>,
          form: event.form,
        });
        finishAiMessageWithoutProgress((message) => ({
          ...message,
          text: '已为你生成出行攻略，点击查看完整方案～',
          streaming: false,
          travelGuide: {
            guideId: event.guideId,
            plan: plan as TravelGuidePlan,
            form: event.form,
          },
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '攻略生成失败，请稍后重试';
        finishAiMessageWithoutProgress((msg) => ({
          ...msg,
          text: message,
          streaming: false,
        }));
        void Taro.showToast({ title: message, icon: 'none' });
      }
      continue;
    }

    if (event.type === 'travel_guide_ready') {
      if (activityLegacyId != null) {
        saveTravelGuideDetail(event.guideId, {
          plan: event.plan as unknown as TravelGuidePlan,
          form: event.form,
          activityLegacyId,
        });
      }
      onTravelGuideReady?.(event);
      finishAiMessageWithoutProgress((message) => ({
        ...message,
        text: message.text || '已为你生成出行攻略，点击查看完整方案～',
        streaming: false,
        travelGuide: {
          guideId: event.guideId,
          plan: event.plan as unknown as TravelGuidePlan,
          form: event.form,
        },
      }));
      continue;
    }

    if (event.type === 'itinerary_ready') {
      onItineraryReady?.(event);
      finishAiMessageWithoutProgress((message) => ({
        ...message,
        text: message.text || '已为你生成专属行程，点击查看～',
        streaming: false,
        itinerary: {
          itineraryId: event.itineraryId,
          activityLegacyId: event.activityLegacyId,
          selectedDjIds: event.selectedDjIds,
          result: {
            itinerary: {
              eventMeta: event.eventMeta,
              days: event.days,
            },
            conflicts: event.conflicts,
            cached: event.cached ?? false,
          },
        },
      }));
      continue;
    }

    if (event.type === 'personality_result_ready') {
      finishAiMessageWithoutProgress((message) => ({
        ...message,
        text: message.text || `你的 Raver 人格：${event.tagline}`,
        streaming: false,
        personalityResult: {
          resultId: event.resultId,
          result: event.result as unknown as PersonalityTestResult,
        },
      }));
      continue;
    }

    if (event.type === 'activity_registered') {
      finishAiMessage((message) => ({
        ...message,
        registeredActivity: {
          activityLegacyId: event.activityLegacyId,
          title: event.title,
          attendees: event.attendees,
          alreadyRegistered: event.alreadyRegistered,
        },
      }));
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
      finishAiMessageWithoutProgress((message) => ({
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
      onProgressEnd?.();
      finishAiMessage((message) => ({
        ...clearAiChatProgress(message),
        streaming: false,
      }));
      await typewriter.waitUntilComplete();
      finishAiMessage((message) =>
        withPrepGuidanceChips(
          {
            ...clearAiChatProgress(message),
            text: typewriter.getTarget() || message.text,
            streaming: false,
          },
          activityLegacyId,
          festivalPlanNextTaskKey,
        ),
      );
      if (event.sessionId) {
        persistSessionFromStream(event.sessionId);
      }
      break;
    }
  }
}
