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
  latitude?: number;
  longitude?: number;
  region?: 'domestic' | 'overseas' | 'hmt';
  image?: string;
  /** Catalog type: outdoor festival (`festival`) or indoor EDM (`indoor`). */
  activityType?: 'festival' | 'indoor';
  hot?: boolean;
  attendees?: number;
  damaiProjectId?: string;
  externalUrl?: string;
}

export type PrivacyLevel = 'public' | 'private';

export type ReportCategory = 'ads' | 'scalper' | 'vulgar';

export type ReportTargetType = 'post' | 'user' | 'comment';

export type AccountRiskStatus = 'normal' | 'restricted' | 'banned';

export type AccountRiskReasonCode = 'scalper' | 'content' | 'reports';

export interface AccountRiskPublicStatus {
  status: AccountRiskStatus;
  postBlockedUntil?: string;
  message?: string;
  reasonCode?: AccountRiskReasonCode;
  appealHint?: string;
}

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
  notificationsEnabled?: boolean;
  privacyLevel?: PrivacyLevel;
  accountRisk?: AccountRiskPublicStatus;
}

export interface AuthLoginResult {
  accessToken: string;
  user: CurrentUser;
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
  notificationsEnabled?: boolean;
  privacyLevel?: PrivacyLevel;
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

export interface FeedbackPayload {
  content: string;
  type?: 'general' | 'account_deletion';
}

export interface FeedbackResult {
  ok: true;
  id: string;
}

export type ReportReviewStatus = 'pending' | 'acknowledged';

export interface ReportStatusResult {
  reported: boolean;
  category?: ReportCategory;
  createdAt?: string;
  reviewStatus?: ReportReviewStatus;
}

export interface ActivityRegistrationResult {
  ok: true;
  activityLegacyId: number;
  status: 'registered';
  alreadyRegistered?: boolean;
  attendees: number;
}

export interface ActivityUnregisterResult {
  ok: true;
  activityLegacyId: number;
  wasRegistered?: boolean;
  attendees: number;
}

export interface ProfileSummary {
  name: string;
  handle: string;
  location: string;
  bio: string;
  avatar: string;
  stats: {
    events: number;
    posts: number;
  };
}

export interface ProfileActivityItem {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  status: 'registered' | 'attended';
}

export interface ProfilePostItem {
  id: string;
  title: string;
  content: string;
  date: string;
  activityLegacyId?: number;
}

export interface EventPostsPage {
  items: EventDetailPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface BuddyPostSearchParsed {
  eventName?: string;
  date?: string;
  genre?: string;
  peopleCount?: string;
  extraKeywords?: string[];
  searchTerms: string[];
}

export interface BuddyPostAiSearchResult {
  parsed: BuddyPostSearchParsed;
  items: EventDetailPost[];
  totalMatched: number;
  totalScanned: number;
}

export interface EventDetailPost {
  id: string;
  userId?: string;
  name: string;
  handle?: string;
  location: string;
  departureCity?: string;
  createdAt?: string;
  body: string;
  tags: string[];
  avatar: string;
  comments?: number;
  /** Present on create when moderation hides the post from public feeds. */
  status?: 'active' | 'hidden';
  moderationReason?: string;
}

export interface PostCommentItem {
  id: string;
  userId: string;
  authorName: string;
  avatar: string;
  body: string;
  time: string;
  replies?: PostCommentItem[];
}

export interface PostCommentsPage {
  items: PostCommentItem[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface CreatePostPayload {
  body: string;
  activityLegacyId?: number;
  eventTitle?: string;
  location?: string;
  tags?: string[];
  /** Default true. False = stored but hidden from activity/popular feeds. */
  listedInFeed?: boolean;
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
  myNextEventPostEngagement?: {
    activityLegacyId: number;
    postId: string;
    unreadReplyCount: number;
  } | null;
}

export type NotificationType = 'general' | 'interaction' | 'system';

/** In-app notification tab grouping (matches backend NotificationCategory). */
export type NotificationCategory = 'system' | 'general';

export type NotificationInteractionType =
  | 'like'
  | 'comment'
  | 'comment_reply'
  | 'activity'
  | 'activity_update'
  | 'post_rejected'
  | 'post_hidden';

export interface NotificationMeta {
  activityLegacyId?: number;
  postId?: string;
  /** Tab grouping; should match type (see notificationDisplay.getNotificationCategory). */
  category?: NotificationCategory;
  type?: NotificationInteractionType;
  actorUserId?: string;
  actorUserName?: string;
  displayEventName?: string;
  templateKey?: string;
  templateParams?: Record<string, string>;
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

export type {
  GenerateItineraryPayload,
  GenerateItineraryResult,
  ItineraryConflict,
  ItineraryDay,
  ItineraryDj,
  ItineraryScheduleSnapshot,
  ItineraryStage,
  ItineraryTimelineDotColor,
  ItineraryTimelineItem,
  ItineraryTimelinePill,
  SaveItineraryPayload,
  SaveItineraryResult,
  SavedItineraryResult,
} from './itinerary';

export type {
  RecognizeTravelPlanReceiptPayload,
  RecognizeTravelPlanReceiptResult,
  SaveTravelPlanPayload,
  SaveTravelPlanResult,
  SavedTravelPlanNode,
  SavedTravelPlanResult,
  TravelPlanCategory,
  TravelPlanNodePayload,
  TravelPlanReceiptCategory,
  TravelPlanReceiptRecognizeForm,
  TravelPlanReceiptRecognizeJobResult,
  TravelPlanReceiptRecognizeJobStatus,
} from './travelPlan';
