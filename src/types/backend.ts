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

export type PrivacyLevel = 'public' | 'friends' | 'private';

export type ReportCategory = 'ads' | 'scalper' | 'vulgar';

export type ReportTargetType = 'post' | 'user' | 'comment';

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
  status: 'registered';
  alreadyRegistered?: boolean;
}

export interface ActivityUnregisterResult {
  ok: true;
  activityLegacyId: number;
  wasRegistered?: boolean;
}

export type PackageTierId = 'pro' | 'pro_plus' | 'ultra';

export type PackageFeatureIcon = 'match' | 'contact' | 'map' | 'exposure' | 'pin';

export interface PackageTierLimits {
  aiMatchCount: number | null;
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
  aiMatch: QuotaSlot;
  contactUnlock: QuotaSlot;
  map: MapEntitlementSlot;
  postPin: QuotaSlot;
  basicExposure: boolean;
}

export interface FreeMonthlyQuota {
  period: string;
  aiMatch: QuotaSlot;
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
  images?: string[];
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
  status: '招募中' | '已组队' | '已隐藏';
  images?: string[];
}

export type PostContentType = 'team' | 'accommodation' | 'carpool' | 'ticket' | 'other';

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
}

export type NotificationType = 'general' | 'interaction' | 'system' | 'match';

export type NotificationInteractionType =
  | 'like'
  | 'comment'
  | 'comment_reply'
  | 'application'
  | 'activity'
  | 'activity_update'
  | 'post_rejected'
  | 'post_hidden'
  | 'match_recommendation';

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

export type LiveInfoCategoryId =
  | 'entry_crowd'
  | 'toilet_queue'
  | 'water_queue'
  | 'smoke_drink';

export interface LiveInfoSummaryRow {
  categoryId: LiveInfoCategoryId;
  score: number;
}

export interface LiveInfoFeedItem {
  id: string;
  userName: string;
  avatar?: string;
  certified: boolean;
  timeLabel: string;
  ratings: { categoryId: LiveInfoCategoryId; score: number }[];
  remark?: string;
  likes: number;
  liked?: boolean;
}

export type LiveInfoCertStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface LiveInfoViewerState {
  isCertified: boolean;
  certStatus: LiveInfoCertStatus;
  certExpiryLabel: string;
  wristbandImageUrl?: string;
  rejectReason?: string;
}

export interface LiveInfoSnapshot {
  activityLegacyId: number;
  eventDate: string;
  viewer: LiveInfoViewerState;
  summary: LiveInfoSummaryRow[];
  certCount: number;
  feed: LiveInfoFeedItem[];
}

export interface SubmitLiveInfoWristbandPayload {
  imageUrl: string;
}

export type SubmitLiveInfoWristbandRejectCode = 'duplicate_image';

export interface SubmitLiveInfoWristbandResult {
  ok: boolean;
  viewer: LiveInfoViewerState;
  message?: string;
  code?: SubmitLiveInfoWristbandRejectCode;
}

export interface PublishLiveInfoPayload {
  ratings: { categoryId: LiveInfoCategoryId; score: number }[];
  remark?: string;
}

export type ItineraryStage = 'main' | 'bass' | 'late' | 'outdoor';

export interface ItineraryDj {
  id: string;
  name: string;
  genre: string;
  genreLabel: string;
  stage: ItineraryStage;
  popularity: number;
  avatarSeed: string;
  genreColor: string;
}

export interface ItineraryConflict {
  artistIds: [string, string];
  artistNames: [string, string];
  dateKey: string;
  overlapStart: string;
  overlapEnd: string;
  message: string;
}

export interface ItineraryScheduleSnapshot {
  activityLegacyId: number;
  eventMeta: string;
  sessions: Array<{
    dateKey: string;
    label: string;
    bannerDateLabel: string;
  }>;
  djs: ItineraryDj[];
  performances: Array<{
    artistId: string;
    artistName: string;
    dateKey: string;
    dateLabel: string;
    genre: string;
    genreLabel: string;
    stage: string;
    stageLabel: string;
    startTime: string;
    endTime: string;
    startMinutes: number;
    endMinutes: number;
    popularity: number;
    avatarSeed: string;
    genreColor: string;
  }>;
  conflicts: ItineraryConflict[];
}

export type ItineraryTimelineDotColor = 'pink' | 'cyan' | 'purple';

export interface ItineraryTimelinePill {
  label: string;
  variant: 'green' | 'pink';
}

export interface ItineraryTimelineItem {
  id: string;
  time: string;
  dotColor: ItineraryTimelineDotColor;
  title: string;
  subtitle?: string;
  timeTag?: string;
  timeTagColor?: ItineraryTimelineDotColor;
  pill?: ItineraryTimelinePill;
  highlighted?: boolean;
}

export interface ItineraryDay {
  id: string;
  label: string;
  bannerDateLabel: string;
  nodeCount: number;
  items: ItineraryTimelineItem[];
}

export interface GenerateItineraryPayload {
  selectedDjIds: string[];
  dateKey?: string;
}

export interface GenerateItineraryResult {
  itinerary: {
    eventMeta: string;
    days: ItineraryDay[];
  };
  conflicts: ItineraryConflict[];
  cached: boolean;
}

export interface SaveItineraryPayload {
  eventMeta: string;
  days: ItineraryDay[];
  selectedDjIds?: string[];
}

export interface SaveItineraryResult {
  ok: true;
  activityLegacyId: number;
  savedAt: string;
}

export interface SavedItineraryResult {
  saved: boolean;
  activityLegacyId?: number;
  selectedDjIds?: string[];
  eventMeta?: string;
  days?: ItineraryDay[];
  updatedAt?: string;
}
