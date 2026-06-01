export type AiAssistantNavIntent = {
  initialMessage?: string;
  activityLegacyId?: number;
  /** Open AI travel-guide plan sheet after entering the assistant. */
  openAiGuideSheet?: boolean;
};

export type ProfileNavIntent = {
  /** Open the profile package upgrade sheet after switching to the profile tab. */
  openPackageSheet?: boolean;
};
