import type { PinDanCategory } from "../utils/apiMappers";

export type PindanTabType = "package" | "hotel" | "transport";

export type ProfileTab = "participated" | "pindan";

export type AimatchTab = "ai" | "pindan" | "ticket" | "events";

export type PindanNavIntent = {
  activityId?: number;
  type?: PindanTabType;
  highlightId?: number;
};

export type ProfileNavIntent = {
  tab?: "pindan";
  highlightId?: number;
};

export type AimatchNavIntent = {
  tab?: AimatchTab;
  highlightPindanId?: string;
  highlightTicketId?: string;
  createCategory?: PinDanCategory;
};

export type JoinToastState = {
  visible: boolean;
  title: string;
  profileId: number | null;
};
