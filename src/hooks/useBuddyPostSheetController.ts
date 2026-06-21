import { useCallback, useState } from 'react';
import { useUgcPublishGuard } from './useUgcPublishGuard';
import { useBuddyPostQuotaGate } from './useBuddyPostQuotaGate';
import { requireAuth } from '../utils/authGate';

type UseBuddyPostSheetControllerOptions = {
  activityLegacyId?: number;
  activityTitle?: string;
  accountRiskEnabled?: boolean;
  /** When set, opening the sheet requires login for that scope. */
  authScope?: 'activity';
  onInvalidActivity?: () => void;
  /** Called synchronously before the sheet is shown (e.g. pin page scroll). */
  onBeforeOpen?: () => void;
};

/** Shared open/close + quota gate for buddy-post sheets (AI tab + event detail). */
export function useBuddyPostSheetController(
  options: UseBuddyPostSheetControllerOptions,
) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { guardPublish, handlePublishError, complianceConfirmDialog } =
    useUgcPublishGuard({
      enabled: options.accountRiskEnabled ?? true,
    });
  const { sheetPostQuota, ensureCanOpenBuddyPostSheet, clearSheetPostQuota } =
    useBuddyPostQuotaGate({
      activityLegacyId: options.activityLegacyId,
      activityTitle: options.activityTitle,
    });

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    clearSheetPostQuota();
  }, [clearSheetPostQuota]);

  const openSheet = useCallback(async (): Promise<boolean> => {
    const legacyId = options.activityLegacyId;
    if (legacyId != null && (!Number.isFinite(legacyId) || legacyId <= 0)) {
      options.onInvalidActivity?.();
      return false;
    }

    const tryOpen = async (): Promise<boolean> => {
      if (!(await guardPublish())) {
        return false;
      }
      const canOpen = await ensureCanOpenBuddyPostSheet();
      if (canOpen) {
        options.onBeforeOpen?.();
        setSheetOpen(true);
      }
      return canOpen;
    };

    if (options.authScope === 'activity') {
      return new Promise((resolve) => {
        const willRun = requireAuth(() => {
          void tryOpen().then(resolve);
        }, 'activity');
        if (!willRun) {
          resolve(false);
        }
      });
    }

    return tryOpen();
  }, [ensureCanOpenBuddyPostSheet, guardPublish, options]);

  return {
    sheetOpen,
    setSheetOpen,
    openSheet,
    closeSheet,
    sheetPostQuota,
    guardPublish,
    handlePublishError,
    complianceConfirmDialog,
  };
}
