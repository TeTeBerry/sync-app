export type AiAssistantNavIntent = {
  initialMessage?: string;
  activityLegacyId?: number;
};

export type ProfileNavIntent = {
  /** Open the profile package upgrade sheet after switching to the profile tab. */
  openPackageSheet?: boolean;
};
