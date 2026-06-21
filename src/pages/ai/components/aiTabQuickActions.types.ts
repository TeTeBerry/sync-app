import type { AiCapability } from '@/domains/ai-capability';
import type { RunCapabilityOptions } from '@/domains/ai-capability/types';

export type AiTabQuickActionsHandlers = {
  openLineup: () => void;
  openSchedule: () => void;
  runCapability: (capability: AiCapability, options?: RunCapabilityOptions) => void;
};
