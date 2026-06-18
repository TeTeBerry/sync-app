import { useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import type { AiGuidePlanFormValues } from '../../../../types/travelGuide';
import type { AiCapability, RunCapabilityOptions } from '@/domains/ai-capability';

type TravelGuideApi = {
  handleSheetSubmit: (form: AiGuidePlanFormValues) => void;
  handleRegenerate: (form: AiGuidePlanFormValues) => void;
};

export function useAiAssistantInitialIntents(options: {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
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
  const initialPrefillGuideHandledRef = useRef(false);
  const initialAutoGuideHandledRef = useRef(false);

  useEffect(() => {
    if (!initialMessage) return;
    if (initialMessageHandledRef.current) return;

    const trimmed = initialMessage.trim();
    if (!trimmed || isStreaming) return;

    initialMessageHandledRef.current = true;
    onInitialMessageSent?.();
    void send({ text: trimmed });
  }, [initialMessage, isStreaming, onInitialMessageSent, send]);

  useEffect(() => {
    if (!initialOpenAiGuideSheet) {
      initialGuideSheetHandledRef.current = false;
      return;
    }
    if (initialPrefillTravelGuideForm) return;
    if (initialGuideSheetHandledRef.current) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
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
    const form = initialPrefillTravelGuideForm;
    if (!form) {
      initialPrefillGuideHandledRef.current = false;
      return;
    }
    if (initialPrefillGuideHandledRef.current) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
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
    const form = initialAutoRunTravelGuideForm;
    if (!form) {
      initialAutoGuideHandledRef.current = false;
      return;
    }
    if (initialAutoGuideHandledRef.current) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
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
