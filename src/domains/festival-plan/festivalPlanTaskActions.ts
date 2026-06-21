import type { FestivalPlanTask } from './buildFestivalPlanChecklist';
import type { AiCapability, RunCapabilityOptions } from '@/domains/ai-capability';

export type FestivalPlanTaskActions = {
  runCapability: (capability: AiCapability, options?: RunCapabilityOptions) => void;
  /** Prep tab: open buddy post sheet without leaving the page. */
  openBuddyPostSheet?: () => void;
};

export type FestivalPlanTaskPressHandler = (task: FestivalPlanTask) => void;
