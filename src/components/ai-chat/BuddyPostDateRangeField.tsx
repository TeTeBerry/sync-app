import { CalendarDays } from '../../components/icons';
import { Picker, Text, View } from '@tarojs/components';
import { displayBuddyPostDate } from './buddyPostSheetDisplayDate';

const BUDDY_PICKER_ICON_COLOR = '#64d2ff';

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
  return (
    <View className="s-ai-guide-plan-sheet__field">
      <View className="s-ai-buddy-post-sheet__field-head">
        <Text className="s-ai-buddy-post-sheet__label">活动时间</Text>
        <Text className="s-ai-buddy-post-sheet__field-hint-inline">
          可选择区间，例如 6月13日-14日
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
              <CalendarDays
                size={16}
                color={BUDDY_PICKER_ICON_COLOR}
                className="s-ai-buddy-post-sheet__picker-icon"
                aria-hidden
              />
              <Text className="s-ai-buddy-post-sheet__picker-value">
                {displayBuddyPostDate(dateStart)}
              </Text>
            </View>
          </Picker>
          <Text className="s-ai-buddy-post-sheet__picker-caption">开始</Text>
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
              <CalendarDays
                size={16}
                color={BUDDY_PICKER_ICON_COLOR}
                className="s-ai-buddy-post-sheet__picker-icon"
                aria-hidden
              />
              <Text className="s-ai-buddy-post-sheet__picker-value">
                {displayBuddyPostDate(dateEnd)}
              </Text>
            </View>
          </Picker>
          <Text className="s-ai-buddy-post-sheet__picker-caption">结束</Text>
        </View>
      </View>
    </View>
  );
}
