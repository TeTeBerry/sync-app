import { CalendarDays } from '../../components/icons';
import { Picker, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { displayBuddyPostDate } from './buddyPostSheetDisplayDate';

type BuddyPostDateRangeFieldProps = {
  dateStart: string;
  dateEnd: string;
  onDateStartChange: (next: string) => void;
  onDateEndChange: (next: string) => void;
};

export function BuddyPostDateRangeField({
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
}: BuddyPostDateRangeFieldProps) {
  const t = useT();
  return (
    <View className="s-ai-guide-plan-sheet__field s-ai-buddy-post-sheet__field--activity-time">
      <View className="s-ai-buddy-post-sheet__field-head">
        <Text className="s-ai-buddy-post-sheet__label">
          {t('ai.activityDateRange')}
        </Text>
        <Text className="s-ai-buddy-post-sheet__field-hint-inline">
          {t('ai.activityDateRangeHint')}
        </Text>
      </View>
      <View className="s-ai-buddy-post-sheet__date-row">
        <View className="s-ai-buddy-post-sheet__date-col">
          <Picker
            mode="date"
            value={dateStart}
            onChange={(e) => {
              const next = e.detail.value;
              onDateStartChange(next);
              if (dateEnd < next) onDateEndChange(next);
            }}
          >
            <View className="s-ai-buddy-post-sheet__picker">
              <View className="s-ai-buddy-post-sheet__picker-icon-wrap" aria-hidden>
                <CalendarDays
                  size={14}
                  className="s-ai-buddy-post-sheet__picker-icon"
                />
              </View>
              <Text className="s-ai-buddy-post-sheet__picker-value">
                {displayBuddyPostDate(dateStart)}
              </Text>
            </View>
          </Picker>
          <Text className="s-ai-buddy-post-sheet__picker-caption">
            {t('ai.dateRangeStart')}
          </Text>
        </View>
        <Text className="s-ai-buddy-post-sheet__date-dash" aria-hidden>
          —
        </Text>
        <View className="s-ai-buddy-post-sheet__date-col">
          <Picker
            mode="date"
            value={dateEnd}
            start={dateStart}
            onChange={(e) => onDateEndChange(e.detail.value)}
          >
            <View className="s-ai-buddy-post-sheet__picker">
              <View className="s-ai-buddy-post-sheet__picker-icon-wrap" aria-hidden>
                <CalendarDays
                  size={14}
                  className="s-ai-buddy-post-sheet__picker-icon"
                />
              </View>
              <Text className="s-ai-buddy-post-sheet__picker-value">
                {displayBuddyPostDate(dateEnd)}
              </Text>
            </View>
          </Picker>
          <Text className="s-ai-buddy-post-sheet__picker-caption">
            {t('ai.dateRangeEnd')}
          </Text>
        </View>
      </View>
    </View>
  );
}
