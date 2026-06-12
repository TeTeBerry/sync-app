import type { LiveInfoCategoryId } from '../config/liveInfoConfig';

export type LiveInfoSummaryRow = {
  categoryId: LiveInfoCategoryId;
  score: number;
};

export type LiveInfoFeedItem = {
  id: string;
  userName: string;
  avatar?: string;
  authorOnSiteVerified?: boolean;
  zoneTag: string;
  zoneLabel: string;
  timeLabel: string;
  ratings: { categoryId: LiveInfoCategoryId; score: number }[];
  remark?: string;
  likes: number;
  liked?: boolean;
};
