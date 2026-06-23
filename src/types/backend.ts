export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type {
  ActivityRegistrationResult,
  ActivityUnregisterResult,
  BackendActivity,
  CatalogLineupArtist,
  CatalogLineupArtistDetail,
  CatalogLineupArtistNextActivity,
} from './activity';

export type {
  AccountRiskPublicStatus,
  AccountRiskReasonCode,
  AccountRiskStatus,
  AuthLoginResult,
  CurrentUser,
  PrivacyLevel,
  ProfileActivityItem,
  ProfileSummary,
  UpdateCurrentUserPayload,
} from './profile';

export type ReportCategory = 'ads' | 'scalper' | 'vulgar';

export type ReportTargetType = 'post' | 'user' | 'comment';

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

export type {
  BuddyPostAiSearchResult,
  BuddyPostSearchParsed,
  CreatePostPayload,
  DeletePostResult,
  EventDetailPost,
  EventPostsPage,
  PostCommentItem,
  PostCommentMutationResult,
  PostCommentsPage,
  ProfilePostItem,
  ProfilePostsPage,
  UpdatePostPayload,
  UpdatePostRecruitPayload,
} from './partner';

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
    region?: 'domestic' | 'overseas' | 'hmt';
    area?: string;
  }>;
  myNextEventPostEngagement?: {
    activityLegacyId: number;
    postId: string;
    unreadReplyCount: number;
  } | null;
}

export type {
  AppNotification,
  NotificationCategory,
  NotificationInteractionType,
  NotificationMeta,
  NotificationType,
} from './notification';

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
