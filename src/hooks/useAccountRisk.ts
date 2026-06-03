import Taro from '@tarojs/taro';
import { useCallback } from 'react';
import {
  accountRiskApiErrorMessage,
  getAccountRiskBlockMessage,
  handleAccountRiskApiError,
  isAccountPublishRestricted,
} from '../utils/accountRisk';
import { useCurrentUserQuery } from './useSyncApi';

export function useAccountRisk() {
  const query = useCurrentUserQuery();
  const accountRisk = query.data?.accountRisk;
  const isPublishRestricted = isAccountPublishRestricted(accountRisk);

  const guardPublish = useCallback(async (): Promise<boolean> => {
    if (!isPublishRestricted) return true;
    void Taro.showToast({
      title: getAccountRiskBlockMessage(accountRisk),
      icon: 'none',
      duration: 3500,
    });
    return false;
  }, [accountRisk, isPublishRestricted]);

  const showPublishBlockedToast = useCallback(() => {
    void Taro.showToast({
      title: getAccountRiskBlockMessage(accountRisk),
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
        void Taro.showToast({
          title: accountRiskApiErrorMessage(error),
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
