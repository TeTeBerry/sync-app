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

export type PrivacyLevel = 'public' | 'friends' | 'private';

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
  likeMate?: boolean;
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
  likeMate?: boolean;
  notificationsEnabled?: boolean;
  privacyLevel?: PrivacyLevel;
}

export interface BlockedUserItem {
  userId: string;
  name: string;
  avatar?: string;
}

export interface BlockListResult {
  blockedUserIds: string[];
  items: BlockedUserItem[];
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
}

export interface ActivityUnregisterResult {
  ok: true;
  activityLegacyId: number;
  wasRegistered?: boolean;
}

export type PackageTierId = 'pro' | 'pro_plus' | 'ultra';

export type PackageFeatureIcon = 'contact' | 'map' | 'exposure' | 'pin';

export interface PackageTierLimits {
  contactUnlockCount: number | null;
  mapDays: number;
  postPinCount: number;
  basicExposure: boolean;
}

export interface PackageFeatureDefinition {
  icon: PackageFeatureIcon;
  text: string;
  unlimited?: boolean;
}

export interface PackageTierDefinition {
  id: PackageTierId;
  name: string;
  priceYuan: number;
  priceLabel: string;
  audience: string;
  badge?: string;
  limits: PackageTierLimits;
  features: PackageFeatureDefinition[];
}

export interface PackageCatalogSheet {
  title: string;
  subtitle: string;
  defaultTierId: PackageTierId;
}

export interface PackageCatalog {
  sheet: PackageCatalogSheet;
  tiers: PackageTierDefinition[];
}

export interface QuotaSlot {
  limit: number | null;
  used: number;
  remaining: number | null;
}

export interface MapEntitlementSlot {
  days: number;
  expiresAt: string;
  active: boolean;
}

export interface EventEntitlementQuotas {
  contactUnlock: QuotaSlot;
  map: MapEntitlementSlot;
  postPin: QuotaSlot;
  basicExposure: boolean;
}

export interface FreeMonthlyQuota {
  period: string;
  contactUnlock: QuotaSlot;
}

export type ProfileEntitlementTierId = PackageTierId | 'free';

export interface EventPackageEntitlement {
  activityLegacyId: number;
  tierId: ProfileEntitlementTierId;
  tierName: string;
  purchasedAt?: string;
  /** ISO start of 30-day package window (usually equals purchasedAt). */
  validFrom?: string;
  /** ISO end of 30-day package window (purchasedAt + 30 days UTC). */
  validUntil?: string;
  quotas: EventEntitlementQuotas;
  freeMonthly?: FreeMonthlyQuota;
  paidTierId?: PackageTierId | null;
}

export interface PurchaseProfilePackagePayload {
  tierId: PackageTierId;
  activityLegacyId: number;
}

export interface PurchaseProfilePackageResult {
  ok: true;
  stubPayment: true;
  entitlement: EventPackageEntitlement;
}

export type EntitlementConsumeBucket = 'free' | 'paid';

export interface ConsumeProfileEntitlementPayload {
  activityLegacyId: number;
}

export interface ConsumeProfileEntitlementResult {
  ok: true;
  bucket: EntitlementConsumeBucket;
  entitlement: EventPackageEntitlement;
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
  packageEntitlement?: EventPackageEntitlement | null;
  packageEntitlements?: EventPackageEntitlement[];
}

export interface ProfileActivityItem {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  status: 'registered' | 'attended';
}

export type PostApplicationStatus = 'pending' | 'accepted' | 'rejected';

export type PostBuddyPreview = {
  body: string;
  location?: string;
  tags: string[];
};

export interface PostApplicationItem {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  message?: string;
  status: PostApplicationStatus;
  appliedAt: string;
  /** Set when post owner opened chat from profile posts. */
  buddyPreview?: PostBuddyPreview;
}

export interface ProfilePostItem {
  id: string;
  title: string;
  content: string;
  status: '招募中' | '已组队' | '已隐藏';
  likes: number;
  comments: number;
  date: string;
  activityLegacyId?: number;
  contentTypes?: PostContentType[];
  images?: string[];
  /** Applicants on posts owned by the current user (newest first). */
  applications?: PostApplicationItem[];
  pendingApplicationCount?: number;
}

export type HomeFeedPostAuthorGender = 'female' | 'male';

export interface HomeFeedPost {
  id: string;
  userId?: string;
  authorGender?: HomeFeedPostAuthorGender;
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
  status: '招募中' | '已组队' | '已隐藏';
  activityLegacyId?: number;
  contentTypes?: PostContentType[];
  tags?: string[];
  images?: string[];
  /** Author passed wristband on-site verification for this activity today. */
  authorOnSiteVerified?: boolean;
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
  nextCursor?: string;
  hasMore: boolean;
}

export interface EventPostsPage {
  items: EventDetailPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface EventDetailPost {
  id: string;
  userId?: string;
  name: string;
  location: string;
  createdAt?: string;
  body: string;
  tags: string[];
  contentTypes?: PostContentType[];
  likes: number;
  liked?: boolean;
  /** Current user has submitted a team application for this post. */
  appliedByMe?: boolean;
  comments: number;
  avatar: string;
  status: '招募中' | '已组队' | '已隐藏';
  images?: string[];
  /** Author passed wristband on-site verification for this activity today. */
  authorOnSiteVerified?: boolean;
}

export type PostContentType =
  | 'team'
  | 'accommodation'
  | 'carpool'
  | 'ticket'
  | 'share'
  | 'other';

export interface CreatePostPayload {
  body: string;
  activityLegacyId?: number;
  eventTitle?: string;
  location?: string;
  tags?: string[];
  contentTypes?: PostContentType[];
  images?: string[];
  /** Default true. False = stored but hidden from activity/popular feeds. */
  listedInFeed?: boolean;
}

export interface UpdatePostPayload {
  body?: string;
  eventTitle?: string;
  status?: 'recruiting' | 'completed';
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
  /** Present when loaded via `GET /home` (merged to avoid extra `/posts/popular` RTT). */
  popularPosts?: HomeFeedPost[];
}

export type NotificationType = 'general' | 'interaction' | 'system' | 'match';

/** In-app notification tab grouping (matches backend NotificationCategory). */
export type NotificationCategory =
  | 'comment'
  | 'like'
  | 'application'
  | 'buddy_recommend'
  | 'system'
  | 'general';

export type NotificationInteractionType =
  | 'like'
  | 'comment'
  | 'comment_reply'
  | 'application'
  | 'activity'
  | 'activity_update'
  | 'post_rejected'
  | 'post_hidden'
  | 'team_dissolved'
  | 'team_accepted'
  | 'match_recommendation';

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

export type {
  GenerateItineraryPayload,
  GenerateItineraryResult,
  ItineraryBuddyRecruitHint,
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
  LiveInfoCategoryId,
  LiveInfoCertStatus,
  LiveInfoFeedFilters,
  LiveInfoFeedItem,
  LiveInfoSnapshot,
  LiveInfoSummaryRow,
  LiveInfoViewerState,
  LiveInfoZone,
  PublishLiveInfoPayload,
  SubmitLiveInfoWristbandPayload,
  SubmitLiveInfoWristbandRejectCode,
  SubmitLiveInfoWristbandResult,
} from './liveInfo';

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
} from './travelPlan';
