import './ContentReportMenuButton.scss';
import ActionSheet from '../ActionSheet';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import {
  useContentReport,
  type ContentReportTarget,
} from '../../hooks/useContentReport';
import type { ReportCategory } from '../../types/backend';
import { useT } from '@/hooks/useI18n';

export type ContentReportMenuButtonProps = ContentReportTarget & {
  className?: string;
  ariaLabel?: string;
};

export function ContentReportMenuButton({
  className,
  ariaLabel,
  ...target
}: ContentReportMenuButtonProps) {
  const { categorySheetOpen, openOverflowMenu, closeCategorySheet, submitCategory } =
    useContentReport(target);
  const t = useT();

  const reportOptions: Array<{ id: ReportCategory; label: string }> = [
    { id: 'scalper', label: t('report.categoryScalper') },
    { id: 'ads', label: t('report.categoryAds') },
    { id: 'vulgar', label: t('report.categoryVulgar') },
  ];

  return (
    <>
      <Button
        className={['s-content-report-menu', className].filter(Boolean).join(' ')}
        aria-label={ariaLabel ?? t('common.more')}
        onClick={(event) => {
          event.stopPropagation();
          openOverflowMenu();
        }}
      >
        <View className="s-content-report-menu__dots" aria-hidden>
          <Text className="s-content-report-menu__dot-text">⋯</Text>
        </View>
      </Button>

      <ActionSheet
        open={categorySheetOpen}
        title={t('report.title')}
        cancelLabel={t('common.cancel')}
        onCancel={closeCategorySheet}
        items={reportOptions.map((option) => ({
          label: option.label,
          onSelect: () => {
            void submitCategory(option.id);
          },
        }))}
      />
    </>
  );
}
