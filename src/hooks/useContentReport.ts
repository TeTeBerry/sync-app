import Taro from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { fetchReportStatus, submitReport } from '../api/sync/reports';
import type { ReportCategory, ReportTargetType } from '../types/backend';
import { requireAuth } from '../utils/authGate';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import {
  buildReportedStatusMessage,
  REPORT_SUBMIT_SUCCESS_MESSAGE,
} from '../utils/reportLabels';

export type ContentReportTarget = {
  targetType: ReportTargetType;
  targetId: string;
  targetUserId?: string;
};

export function useContentReport(target: ContentReportTarget) {
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showReportedModal = useCallback(
    async (status: Awaited<ReturnType<typeof fetchReportStatus>>) => {
      await Taro.showModal({
        title: '已举报',
        content: buildReportedStatusMessage(status),
        showCancel: false,
        confirmText: '知道了',
      });
    },
    [],
  );

  const startReport = useCallback(async () => {
    try {
      const status = await fetchReportStatus(target.targetType, target.targetId);
      if (status.reported) {
        await showReportedModal(status);
        return;
      }
      setCategorySheetOpen(true);
    } catch (error) {
      void Taro.showToast({
        title: getApiErrorMessage(error, '无法获取举报状态'),
        icon: 'none',
      });
    }
  }, [showReportedModal, target.targetId, target.targetType]);

  const openOverflowMenu = useCallback(() => {
    requireAuth(() => {
      void Taro.showActionSheet({
        itemList: ['举报'],
        success: (result) => {
          if (result.tapIndex === 0) {
            void startReport();
          }
        },
      });
    }, 'social');
  }, [startReport]);

  const closeCategorySheet = useCallback(() => {
    if (submitting) return;
    setCategorySheetOpen(false);
  }, [submitting]);

  const submitCategory = useCallback(
    async (category: ReportCategory) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await submitReport({
          targetType: target.targetType,
          targetId: target.targetId,
          targetUserId: target.targetUserId,
          category,
        });
        setCategorySheetOpen(false);
        await Taro.showModal({
          title: '举报已提交',
          content: REPORT_SUBMIT_SUCCESS_MESSAGE,
          showCancel: false,
          confirmText: '知道了',
        });
      } catch (error) {
        const message = getApiErrorMessage(error, '举报提交失败');
        if (message.includes('已举报')) {
          setCategorySheetOpen(false);
          try {
            const status = await fetchReportStatus(target.targetType, target.targetId);
            await showReportedModal(status);
          } catch {
            await Taro.showModal({
              title: '已举报',
              content: message,
              showCancel: false,
              confirmText: '知道了',
            });
          }
          return;
        }
        void Taro.showToast({ title: message, icon: 'none' });
      } finally {
        setSubmitting(false);
      }
    },
    [
      showReportedModal,
      submitting,
      target.targetId,
      target.targetType,
      target.targetUserId,
    ],
  );

  return {
    categorySheetOpen,
    submitting,
    openOverflowMenu,
    closeCategorySheet,
    submitCategory,
  };
}
