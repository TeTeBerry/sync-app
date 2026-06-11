import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp } from '../../../../components/icons';
import { Text, View } from '@tarojs/components';
import {
  formatTravelPlanRangeSummary,
  type TravelPlanTimeRange,
} from '../travelPlanDateTime';
import { TravelPlanRangeCalendar } from './TravelPlanRangeCalendar';

type TravelPlanDateTimeRangeFieldProps = {
  sheetOpen: boolean;
  value: TravelPlanTimeRange;
  onChange: (next: TravelPlanTimeRange) => void;
};

export function TravelPlanDateTimeRangeField({
  sheetOpen,
  value,
  onChange,
}: TravelPlanDateTimeRangeFieldProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      setExpanded(false);
    }
  }, [sheetOpen]);

  return (
    <View className="s-travel-plan-datetime">
      <View
        className="s-travel-plan-datetime__trigger"
        role="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <CalendarDays size={16} color="#8e8e93" aria-hidden />
        <Text className="s-travel-plan-datetime__trigger-label">
          {formatTravelPlanRangeSummary(value)}
        </Text>
        {expanded ? (
          <ChevronUp size={16} color="#8e8e93" aria-hidden />
        ) : (
          <ChevronDown size={16} color="#8e8e93" aria-hidden />
        )}
      </View>

      {expanded ? (
        <View className="s-travel-plan-datetime__calendar">
          <TravelPlanRangeCalendar value={value} onChange={onChange} />
        </View>
      ) : null}
    </View>
  );
}
