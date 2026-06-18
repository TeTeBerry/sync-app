import './ContentReportMenuButton.scss';
import ActionSheet from '../ActionSheet';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import {
  useContentReport,
  type ContentReportTarget,
} from '../../hooks/useContentReport';
import { REPORT_CATEGORY_OPTIONS } from '../../utils/reportLabels';

export type ContentReportMenuButtonProps = ContentReportTarget & {
  className?: string;
  ariaLabel?: string;
};

export function ContentReportMenuButton({
  className,
  ariaLabel = '更多',
  ...target
}: ContentReportMenuButtonProps) {
  const {
    categorySheetOpen,
    submitting,
    openOverflowMenu,
    closeCategorySheet,
    submitCategory,
  } = useContentReport(target);

  return (
    <>
      <Button
        className={['s-content-report-menu', className].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
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
        title="选择举报原因"
        cancelLabel="取消"
        onCancel={closeCategorySheet}
        items={REPORT_CATEGORY_OPTIONS.map((option) => ({
          label: option.label,
          onSelect: () => {
            void submitCategory(option.id);
          },
        }))}
      />
    </>
  );
}
