import { useCallback, useMemo } from 'react';
import {
  capabilityFromFestivalPlanTaskKey,
  capabilityFromSuggestedReplyLabel,
  capabilityFromWelcomeChipAction,
  runAiCapability,
  type AiCapability,
  type CapabilityHandlers,
  type RunCapabilityOptions,
} from '@/domains/ai-capability';
import type { FestivalPlanTask } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { WelcomeCapabilityChipAction } from '@/utils/aiAssistantCapabilityDiscovery';

export function useAiCapabilityRunner(handlers: CapabilityHandlers) {
  const runCapability = useCallback(
    (capability: AiCapability, options?: RunCapabilityOptions) => {
      runAiCapability(capability, handlers, options);
    },
    [handlers],
  );

  const runFromWelcomeChipAction = useCallback(
    (
      action: WelcomeCapabilityChipAction,
      source: RunCapabilityOptions['source'] = 'chat',
    ) => {
      const capability = capabilityFromWelcomeChipAction(action);
      if (!capability) return false;
      runCapability(capability, { source });
      return true;
    },
    [runCapability],
  );

  const runFromSuggestedReplyLabel = useCallback(
    (label: string, source: RunCapabilityOptions['source'] = 'chat') => {
      const capability = capabilityFromSuggestedReplyLabel(label);
      if (!capability) return false;
      runCapability(capability, { source });
      return true;
    },
    [runCapability],
  );

  const runFromFestivalPlanTask = useCallback(
    (task: FestivalPlanTask) => {
      if (task.done) return false;
      const capability = capabilityFromFestivalPlanTaskKey(task.key);
      if (!capability) return false;
      runCapability(capability, { source: 'festival_plan' });
      return true;
    },
    [runCapability],
  );

  return useMemo(
    () => ({
      runCapability,
      runFromWelcomeChipAction,
      runFromSuggestedReplyLabel,
      runFromFestivalPlanTask,
    }),
    [
      runCapability,
      runFromFestivalPlanTask,
      runFromSuggestedReplyLabel,
      runFromWelcomeChipAction,
    ],
  );
}
