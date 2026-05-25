import type { PinDanCategory } from "../utils/apiMappers";

export type PindanTabType = "package" | "hotel" | "transport";

export type ProfileTab = "participated" | "pindan" | "tickets";

export type AimatchTab = "ai" | "pindan" | "ticket" | "events";

export type PindanNavIntent = {
  activityId?: number;
  type?: PindanTabType;
  highlightId?: number;
};

export type ProfileNavIntent = {
  tab?: "pindan" | "tickets";
  highlightId?: number;
  highlightTicketId?: string;
};

export type AimatchNavIntent = {
  tab?: AimatchTab;
  initialMessage?: string;
  highlightPindanId?: string;
  highlightTicketId?: string;
  createCategory?: PinDanCategory;
};

export type JoinToastState = {
  visible: boolean;
  title: string;
  profileId: number | null;
};
