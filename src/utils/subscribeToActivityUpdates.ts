export type ActivityUpdateSubscribeResult =
  | 'wechat_accepted'
  | 'in_app_only'
  | 'auth_required'
  | 'invalid_activity'
  | 'register_failed';

export type ActivityUpdateUnsubscribeResult =
  | 'success'
  | 'auth_required'
  | 'invalid_activity'
  | 'unregister_failed';

export {
  hydrateActivitySubscriptionStore,
  refreshMyActivitiesAfterEngagement,
  subscribeToActivityUpdates,
  unsubscribeFromActivityUpdates,
} from '../stores/activitySubscriptionActions';
