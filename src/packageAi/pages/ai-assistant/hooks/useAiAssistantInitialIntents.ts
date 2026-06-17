import { useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import type { AiGuidePlanFormValues } from '../../../../types/travelGuide';
import type { AiCapability } from '@/domains/ai-capability';

type TravelGuideApi = {
  handleSheetSubmit: (form: AiGuidePlanFormValues) => void;
};

export function useAiAssistantInitialIntents(options: {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
  initialAutoRunTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  isStreaming: boolean;
  send: (payload: { text: string }) => Promise<void>;
  travelGuide: TravelGuideApi;
  runCapability: (capability: AiCapability) => void;
  onInitialMessageSent?: () => void;
}) {
  const {
    initialMessage,
    initialOpenAiGuideSheet = false,
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
    if (!initialOpenAiGuideSheet || initialGuideSheetHandledRef.current) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
    initialGuideSheetHandledRef.current = true;
    onInitialMessageSent?.();
    runCapability('travel_guide', { source: 'deep_link' });
  }, [activityLegacyId, initialOpenAiGuideSheet, onInitialMessageSent, runCapability]);

  useEffect(() => {
    const form = initialAutoRunTravelGuideForm;
    if (!form || initialAutoGuideHandledRef.current) return;
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
