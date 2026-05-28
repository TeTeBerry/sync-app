export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface BackendActivity {
  _id: string;
  legacyId: number;
  name: string;
  code: string;
  alias?: string[];
  date?: string;
  location?: string;
  image?: string;
  hot?: boolean;
  attendees?: number;
  damaiProjectId?: string;
  externalUrl?: string;
}

export type PrivacyLevel = "public" | "friends" | "private";

export type ReportCategory = "ads" | "scalper" | "vulgar";

export type ReportTargetType = "post" | "user" | "comment";

export interface CurrentUser {
  id: string;
  name: string;
  handle: string;
  location: string;
  bio: string;
  avatar: string;
  city?: string;
  favorGenres?: string[];
  budgetLevel?: string;
  likeMate?: boolean;
  notificationsEnabled?: boolean;
  privacyLevel?: PrivacyLevel;
}

export interface UpdateCurrentUserPayload {
  name?: string;
  handle?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  city?: string;
  favorGenres?: string[];
  budgetLevel?: string;
  likeMate?: boolean;
  notificationsEnabled?: boolean;
  privacyLevel?: PrivacyLevel;
}

export interface BlockListResult {
  blockedUserIds: string[];
}

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  targetUserId?: string;
  category: ReportCategory;
  reason?: string;
}

export interface ReportResult {
  ok: true;
  id: string;
}

export interface ActivityRegistrationResult {
  ok: true;
  activityLegacyId: number;
  status: "registered";
  alreadyRegistered?: boolean;
}

export interface ActivityUnregisterResult {
  ok: true;
  activityLegacyId: number;
  wasRegistered?: boolean;
}

export interface ProfileSummary {
  name: string;
  handle: string;
  location: string;
  bio: string;
  avatar: string;
  stats: {
    events: number;
    matchSuccess: number;
    likes: number;
    posts: number;
  };
}

export interface ProfileActivityItem {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  status: "registered" | "attended";
}

export interface ProfilePostItem {
  id: string;
  title: string;
  content: string;
  status: "招募中" | "已组队" | "已隐藏";
  likes: number;
  comments: number;
  date: string;
  activityLegacyId?: number;
  contentTypes?: PostContentType[];
  images?: string[];
}

export interface HomeFeedPost {
  id: string;
  userId?: string;
  name: string;
  handle: string;
  event: string;
  location: string;
  body: string;
  time: string;
  likes: number;
  liked?: boolean;
  comments: number;
  avatar: string;
  status: "招募中" | "已组队" | "已隐藏";
  contentTypes?: PostContentType[];
  images?: string[];
}

export interface PostCommentItem {
  id: string;
  userId: string;
  authorName: string;
  avatar: string;
  body: string;
  time: string;
}

export interface EventDetailPost {
  id: string;
  userId?: string;
  name: string;
  location: string;
  /** @deprecated Prefer createdAt; kept for backward compatibility. */
  time: string;
  createdAt?: string;
  body: string;
  tags: string[];
  contentTypes?: PostContentType[];
  likes: number;
  liked?: boolean;
  comments: number;
  avatar: string;
  status: "招募中" | "已组队" | "已隐藏";
  images?: string[];
}

export type PostContentType =
  | "team"
  | "accommodation"
  | "carpool"
  | "ticket"
  | "other";

export interface CreatePostPayload {
  body: string;
  activityLegacyId?: number;
  eventTitle?: string;
  location?: string;
  tags?: string[];
  contentTypes?: PostContentType[];
  images?: string[];
}

export interface UpdatePostPayload {
  body?: string;
  eventTitle?: string;
  status?: "recruiting" | "completed";
}

export interface PostActionResult {
  ok: true;
  alreadyApplied?: boolean;
}

export interface HomeSummary {
  heat: {
    people: number;
    growthPercent: number;
  };
  signupEvents: Array<{
    id: number;
    title: string;
    date: string;
    location: string;
    image: string;
    category: string;
    hot: boolean;
    attendees: number;
    going: boolean;
  }>;
}

export type NotificationType = "general" | "interaction" | "system" | "match";

export type NotificationInteractionType =
  | "like"
  | "comment"
  | "comment_reply"
  | "application"
  | "activity"
  | "activity_update"
  | "post_rejected"
  | "post_hidden"
  | "match_recommendation";

export interface NotificationMeta {
  activityLegacyId?: number;
  postId?: string;
  type?: NotificationInteractionType;
  /** @deprecated Prefer activityLegacyId (number). */
  activityId?: string;
  actorUserId?: string;
  actorUserName?: string;
  displayEventName?: string;
  templateKey?: string;
  templateParams?: Record<string, string>;
  matchPostIds?: string[];
  rejectionReason?: string;
  parentCommentId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  meta?: NotificationMeta;
  createdAt: string;
}
