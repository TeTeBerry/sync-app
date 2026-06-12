import './PostActionSheet.scss';
import {
  Ban,
  ChevronLeft,
  Flag,
  Megaphone,
  ShieldAlert,
  Trash2,
  X,
} from '../../components/icons';
import React, { useMemo } from 'react';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import type { ReportCategory, ReportReviewStatus } from '../../types/backend';
import { POST_ACTION_DESTRUCTIVE_COLOR } from '../../utils/postActionColors';
import { cn, Button } from '../ui';
import { Text, View } from '@tarojs/components';

export type PostActionSheetStep = 'actions' | 'report';

export type PostActionSheetMode = 'owner' | 'viewer';

export type PostActionSheetRow = {
  id: string;
  label: string;
  hint?: string;
  tone?: 'default' | 'destructive' | 'accent';
  icon: React.ReactNode;
  onPress: () => void;
};

export type PostActionSheetProps = {
  open: boolean;
  step: PostActionSheetStep;
  mode: PostActionSheetMode;
  cancelLabel?: string;
  onCancel: () => void;
  onBack?: () => void;
  onDelete?: () => void;
  onOpenReport?: () => void;
  onBlock?: () => void;
  onReportCategory?: (category: ReportCategory) => void;
  reportAlreadySubmitted?: boolean;
  reportReviewStatus?: ReportReviewStatus;
  reportStatusLoading?: boolean;
  onViewReportStatus?: () => void;
};

const REPORT_META: Record<
  ReportCategory,
  { label: string; hint: string; icon: React.ReactNode }
> = {
  ads: {
    label: '广告骚扰',
    hint: '营销引流、重复刷屏',
    icon: <Megaphone size={18} color="#4cc9f0" aria-hidden />,
  },
  scalper: {
    label: '黄牛 / 欺诈',
    hint: '假票、加价倒卖或诈骗',
    icon: <ShieldAlert size={18} color="#fbbf24" aria-hidden />,
  },
  vulgar: {
    label: '低俗内容',
    hint: '色情、辱骂或其它不适内容',
    icon: <Flag size={18} color="#ff0066" aria-hidden />,
  },
};

function PostActionSheetRowButton({ row }: { row: PostActionSheetRow }) {
  return (
    <Button
      className={cn(
        's-post-action-sheet__row',
        row.tone === 'destructive' && 's-post-action-sheet__row--destructive',
        row.tone === 'accent' && 's-post-action-sheet__row--accent',
      )}
      hoverClass="s-post-action-sheet__row--pressed"
      onClick={row.onPress}
    >
      <View
        className={cn(
          's-post-action-sheet__row-icon',
          row.tone === 'destructive' && 's-post-action-sheet__row-icon--destructive',
          row.tone === 'accent' && 's-post-action-sheet__row-icon--accent',
        )}
      >
        {row.icon}
      </View>
      <View className="s-post-action-sheet__row-text">
        <Text className="s-post-action-sheet__row-label">{row.label}</Text>
        {row.hint ? (
          <Text className="s-post-action-sheet__row-hint">{row.hint}</Text>
        ) : null}
      </View>
    </Button>
  );
}

export const PostActionSheet: React.FC<PostActionSheetProps> = ({
  open,
  step,
  mode,
  cancelLabel = '取消',
  onCancel,
  onBack,
  onDelete,
  onOpenReport,
  onBlock,
  onReportCategory,
  reportAlreadySubmitted = false,
  reportReviewStatus,
  reportStatusLoading = false,
  onViewReportStatus,
}) => {
  useOverlayLock(open);

  const reportAcknowledged =
    reportAlreadySubmitted && reportReviewStatus === 'acknowledged';

  const header = useMemo(() => {
    if (step === 'report') {
      return {
        title: '选择举报原因',
        subtitle: '我们会尽快审核并处理你的反馈',
      };
    }
    if (mode === 'owner') {
      return {
        title: '管理帖子',
        subtitle: '删除后无法恢复，请谨慎操作',
      };
    }
    return {
      title: '更多操作',
      subtitle: '举报或屏蔽，帮助我们维护社区环境',
    };
  }, [mode, step]);

  const rows = useMemo((): PostActionSheetRow[] => {
    if (step === 'report') {
      return (['ads', 'scalper', 'vulgar'] as ReportCategory[]).map((category) => {
        const meta = REPORT_META[category];
        return {
          id: category,
          label: meta.label,
          hint: meta.hint,
          tone: 'default' as const,
          icon: meta.icon,
          onPress: () => onReportCategory?.(category),
        };
      });
    }

    if (mode === 'owner' && onDelete) {
      return [
        {
          id: 'delete',
          label: '删除帖子',
          hint: '从活动页移除这条组队信息',
          tone: 'destructive',
          icon: <Trash2 size={18} color={POST_ACTION_DESTRUCTIVE_COLOR} aria-hidden />,
          onPress: onDelete,
        },
      ];
    }

    const list: PostActionSheetRow[] = [];
    if (onOpenReport || reportAlreadySubmitted) {
      list.push({
        id: 'report',
        label: reportAcknowledged
          ? '已受理'
          : reportAlreadySubmitted
            ? '已举报'
            : '举报这条帖子',
        hint: reportAcknowledged
          ? '平台已处理，点击查看说明'
          : reportAlreadySubmitted
            ? '核实中，点击查看进度'
            : reportStatusLoading
              ? '正在检查举报状态…'
              : '广告、欺诈或不当内容',
        tone: reportAlreadySubmitted ? 'default' : 'accent',
        icon: <Flag size={18} color="#ff0066" aria-hidden />,
        onPress: reportAlreadySubmitted ? () => onViewReportStatus?.() : onOpenReport!,
      });
    }
    if (onBlock) {
      list.push({
        id: 'block',
        label: '屏蔽该用户',
        hint: '不再看到 TA 的帖子与互动',
        tone: 'default',
        icon: <Ban size={18} color="#4cc9f0" aria-hidden />,
        onPress: onBlock,
      });
    }
    return list;
  }, [
    mode,
    onBlock,
    onDelete,
    onOpenReport,
    onReportCategory,
    reportAcknowledged,
    reportAlreadySubmitted,
    reportReviewStatus,
    reportStatusLoading,
    onViewReportStatus,
    step,
  ]);

  return (
    <View
      className={cn(
        's-overlay s-overlay--sheet s-post-action-sheet',
        !open && 's-overlay--off',
      )}
      catchMove
      role="presentation"
      aria-hidden={!open}
    >
      <View className="s-overlay__backdrop" catchMove onClick={onCancel} />
      <View className="s-post-action-sheet__stack">
        <View className="s-overlay__panel s-post-action-sheet__card" role="menu">
          <View className="s-post-action-sheet__handle" aria-hidden />
          <View
            className={cn(
              's-post-action-sheet__header',
              step !== 'report' && 's-post-action-sheet__header--no-back',
            )}
          >
            {step === 'report' && onBack ? (
              <Button
                className="s-post-action-sheet__back"
                hoverClass="s-post-action-sheet__icon-btn--pressed"
                aria-label="返回"
                onClick={onBack}
              >
                <ChevronLeft size={20} color="#fff" aria-hidden />
              </Button>
            ) : null}
            <View className="s-post-action-sheet__header-copy">
              <Text className="s-post-action-sheet__title">{header.title}</Text>
              <Text className="s-post-action-sheet__subtitle">{header.subtitle}</Text>
            </View>
            <Button
              className="s-post-action-sheet__close"
              hoverClass="s-post-action-sheet__icon-btn--pressed"
              aria-label="关闭"
              onClick={onCancel}
            >
              <X size={18} color="#fff" aria-hidden />
            </Button>
          </View>

          <View className="s-post-action-sheet__group">
            {rows.map((row) => (
              <PostActionSheetRowButton key={row.id} row={row} />
            ))}
          </View>
        </View>

        <Button
          className="s-post-action-sheet__cancel"
          hoverClass="s-post-action-sheet__cancel--pressed"
          onClick={onCancel}
        >
          <Text className="s-post-action-sheet__cancel-label">{cancelLabel}</Text>
        </Button>
      </View>
    </View>
  );
};
