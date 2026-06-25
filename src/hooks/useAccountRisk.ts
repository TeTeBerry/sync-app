import { useCallback } from 'react';
import {
  accountRiskApiErrorMessage,
  getAccountRiskBlockMessage,
  handleAccountRiskApiError,
  isAccountPublishRestricted,
} from '../utils/accountRisk';
import type { QueryEnableOptions } from './sync/types';
import { useCurrentUserQuery } from './sync/profile';
import { showAppToast } from '@/utils/appToast';

export function useAccountRisk(options?: QueryEnableOptions) {
  const query = useCurrentUserQuery(options);
  const accountRisk = query.data?.accountRisk;
  const isPublishRestricted = isAccountPublishRestricted(accountRisk);

  const guardPublish = useCallback(async (): Promise<boolean> => {
    if (!isPublishRestricted) return true;
    showAppToast(getAccountRiskBlockMessage(accountRisk), {
      raw: true,
      icon: 'none',
      duration: 3500,
    });
    return false;
  }, [accountRisk, isPublishRestricted]);

  const showPublishBlockedToast = useCallback(() => {
    showAppToast(getAccountRiskBlockMessage(accountRisk), {
      raw: true,
      icon: 'none',
      duration: 3500,
    });
  }, [accountRisk]);

  /**
   * Handles account-risk 403 (refreshes user + toast). Returns true if handled.
   */
  const handlePublishError = useCallback(
    async (error: unknown): Promise<boolean> => {
      const handled = await handleAccountRiskApiError(error);
      if (handled) {
        void query.refetch();
        showAppToast(accountRiskApiErrorMessage(error), {
          raw: true,
          icon: 'none',
          duration: 3500,
        });
        return true;
      }
      return false;
    },
    [query],
  );

  return {
    accountRisk,
    isPublishRestricted,
    isLoading: query.isLoading,
    guardPublish,
    showPublishBlockedToast,
    handlePublishError,
    refreshAccountRisk: query.refetch,
  };
}
