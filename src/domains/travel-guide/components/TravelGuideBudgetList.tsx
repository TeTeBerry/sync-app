import { Text, View } from '@tarojs/components';
import type { TravelGuideBudgetItem } from '@/types/travelGuide';
import './TravelGuideBudgetList.scss';

export function TravelGuideBudgetList({ items }: { items: TravelGuideBudgetItem[] }) {
  return (
    <View className="s-travel-guide-budget-list">
      {items.map((item) => (
        <View key={item.label} className="s-travel-guide-budget-list__item">
          <View className="s-travel-guide-budget-list__row">
            <View className="s-travel-guide-budget-list__dot" aria-hidden />
            <Text className="s-travel-guide-budget-list__main">
              {item.label}: {item.range}
            </Text>
          </View>
          {item.note ? (
            <Text className="s-travel-guide-budget-list__note">{item.note}</Text>
          ) : null}
          {item.details?.length ? (
            <View className="s-travel-guide-budget-list__details">
              {item.details.map((detail) => (
                <View key={detail} className="s-travel-guide-budget-list__detail-row">
                  <Text
                    className="s-travel-guide-budget-list__detail-marker"
                    aria-hidden
                  >
                    ·
                  </Text>
                  <Text className="s-travel-guide-budget-list__detail-text">
                    {detail}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
