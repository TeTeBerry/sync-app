import { useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import type { AiGuidePlanFormValues } from '../../../../types/travelGuide';
import type { AiCapability, RunCapabilityOptions } from '@/domains/ai-capability';
import {
  resolveInitialAutoGuideIntent,
  resolveInitialCapabilitySheetIntent,
  resolveInitialGuideSheetIntent,
  resolveInitialMessageIntent,
  resolveInitialPrefillGuideIntent,
} from './aiAssistantInitialIntents.util';

type TravelGuideApi = {
  handleSheetSubmit: (form: AiGuidePlanFormValues) => void;
  handleRegenerate: (form: AiGuidePlanFormValues) => void;
};

export function useAiAssistantInitialIntents(options: {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
  initialOpenItinerarySheet?: boolean;
  initialOpenBuddyPostSheet?: boolean;
  initialPrefillTravelGuideForm?: AiGuidePlanFormValues | null;
  initialAutoRunTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  isStreaming: boolean;
  send: (payload: { text: string }) => Promise<void>;
  travelGuide: TravelGuideApi;
  runCapability: (capability: AiCapability, options?: RunCapabilityOptions) => void;
  onInitialMessageSent?: () => void;
}) {
  const {
    initialMessage,
    initialOpenAiGuideSheet = false,
    initialOpenItinerarySheet = false,
    initialOpenBuddyPostSheet = false,
    initialPrefillTravelGuideForm = null,
    initialAutoRunTravelGuideForm = null,
    activityLegacyId,
    isStreaming,
    send,
    travelGuide,
    runCapability,
    onInitialMessageSent,
  } = options;

  const initialMessageHandledRef = useRef(false);
  const initialGuideSheetHandledRef = useRef(false);
  const initialItinerarySheetHandledRef = useRef(false);
  const initialBuddyPostSheetHandledRef = useRef(false);
  const initialPrefillGuideHandledRef = useRef(false);
  const initialAutoGuideHandledRef = useRef(false);

  useEffect(() => {
    const intent = resolveInitialMessageIntent({
      initialMessage,
      isStreaming,
      alreadyHandled: initialMessageHandledRef.current,
    });
    if (intent.kind === 'skip' || intent.kind === 'wait') return;

    initialMessageHandledRef.current = true;
    onInitialMessageSent?.();
    void send({ text: intent.text });
  }, [initialMessage, isStreaming, onInitialMessageSent, send]);

  useEffect(() => {
    if (!initialOpenAiGuideSheet) {
      initialGuideSheetHandledRef.current = false;
      return;
    }

    const action = resolveInitialGuideSheetIntent({
      initialOpenAiGuideSheet,
      initialPrefillTravelGuideForm,
      activityLegacyId,
      alreadyHandled: initialGuideSheetHandledRef.current,
    });
    if (action === 'skip') return;

    initialGuideSheetHandledRef.current = true;
    onInitialMessageSent?.();
    runCapability('travel_guide', { source: 'deep_link' });
  }, [
    activityLegacyId,
    initialOpenAiGuideSheet,
    initialPrefillTravelGuideForm,
    onInitialMessageSent,
    runCapability,
  ]);

  useEffect(() => {
    if (!initialOpenItinerarySheet) {
      initialItinerarySheetHandledRef.current = false;
      return;
    }

    const action = resolveInitialCapabilitySheetIntent({
      enabled: initialOpenItinerarySheet,
      activityLegacyId,
      alreadyHandled: initialItinerarySheetHandledRef.current,
    });
    if (action === 'skip') return;

    initialItinerarySheetHandledRef.current = true;
    onInitialMessageSent?.();
    runCapability('itinerary', { source: 'deep_link' });
  }, [
    activityLegacyId,
    initialOpenItinerarySheet,
    onInitialMessageSent,
    runCapability,
  ]);

  useEffect(() => {
    if (!initialOpenBuddyPostSheet) {
      initialBuddyPostSheetHandledRef.current = false;
      return;
    }

    const action = resolveInitialCapabilitySheetIntent({
      enabled: initialOpenBuddyPostSheet,
      activityLegacyId,
      alreadyHandled: initialBuddyPostSheetHandledRef.current,
    });
    if (action === 'skip') return;

    initialBuddyPostSheetHandledRef.current = true;
    onInitialMessageSent?.();
    runCapability('buddy_post', { source: 'deep_link' });
  }, [
    activityLegacyId,
    initialOpenBuddyPostSheet,
    onInitialMessageSent,
    runCapability,
  ]);

  useEffect(() => {
    const form = resolveInitialPrefillGuideIntent({
      initialPrefillTravelGuideForm,
      activityLegacyId,
      alreadyHandled: initialPrefillGuideHandledRef.current,
    });
    if (!form) {
      initialPrefillGuideHandledRef.current = false;
      return;
    }

    initialPrefillGuideHandledRef.current = true;
    initialGuideSheetHandledRef.current = true;
    onInitialMessageSent?.();
    Taro.nextTick(() => {
      travelGuide.handleRegenerate(form);
    });
  }, [
    activityLegacyId,
    initialPrefillTravelGuideForm,
    onInitialMessageSent,
    travelGuide,
  ]);

  useEffect(() => {
    const form = resolveInitialAutoGuideIntent({
      initialAutoRunTravelGuideForm,
      activityLegacyId,
      alreadyHandled: initialAutoGuideHandledRef.current,
    });
    if (!form) {
      initialAutoGuideHandledRef.current = false;
      return;
    }

    initialAutoGuideHandledRef.current = true;
    onInitialMessageSent?.();
    Taro.nextTick(() => {
      travelGuide.handleSheetSubmit(form);
    });
  }, [
    activityLegacyId,
    initialAutoRunTravelGuideForm,
    onInitialMessageSent,
    travelGuide,
  ]);
}
