import { useCallback } from 'react';
import {
  UGC_PUBLISH_COMPLIANCE_CONFIRM_TEXT,
  UGC_PUBLISH_COMPLIANCE_MESSAGE,
  UGC_PUBLISH_COMPLIANCE_TITLE,
} from '../constants/ugcPublishCompliance';
import {
  ackUgcPublishCompliance,
  hasUgcPublishComplianceAck,
} from '../utils/ugcPublishComplianceStorage';
import type { QueryEnableOptions } from './sync/types';
import { useAccountRisk } from './useAccountRisk';
import { useConfirmDialog } from './useConfirmDialog';

/**
 * Account-risk publish gate + one-time (per legal version) UGC compliance confirm.
 */
export function useUgcPublishGuard(options?: QueryEnableOptions) {
  const accountRisk = useAccountRisk(options);
  const { confirm, confirmDialog: complianceConfirmDialog } = useConfirmDialog({
    cancelText: '取消',
    confirmText: UGC_PUBLISH_COMPLIANCE_CONFIRM_TEXT,
  });

  const guardPublish = useCallback(async (): Promise<boolean> => {
    if (!(await accountRisk.guardPublish())) {
      return false;
    }
    if (hasUgcPublishComplianceAck()) {
      return true;
    }
    const accepted = await confirm({
      title: UGC_PUBLISH_COMPLIANCE_TITLE,
      message: UGC_PUBLISH_COMPLIANCE_MESSAGE,
      confirmText: UGC_PUBLISH_COMPLIANCE_CONFIRM_TEXT,
    });
    if (accepted) {
      ackUgcPublishCompliance();
    }
    return accepted;
  }, [accountRisk, confirm]);

  return {
    ...accountRisk,
    guardPublish,
    complianceConfirmDialog,
  };
}
