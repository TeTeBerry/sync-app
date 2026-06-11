import { useEffect, useState } from 'react';
import { Input, Text, View } from '@tarojs/components';
import { parseTravelPlanCostInput } from '../utils/travelPlanAddForm';
import { formatTravelPlanCost } from '../utils/travelPlanMock';

type TravelPlanNodePriceFieldProps = {
  value?: number;
  accent: string;
  onChange: (price: number | undefined) => void;
};

function formatDraftValue(price?: number) {
  if (price == null) {
    return '';
  }
  return String(price);
}

export function TravelPlanNodePriceField({
  value,
  accent,
  onChange,
}: TravelPlanNodePriceFieldProps) {
  const [draft, setDraft] = useState(() => formatDraftValue(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(formatDraftValue(value));
    }
  }, [focused, value]);

  const commitDraft = () => {
    const parsed = parseTravelPlanCostInput(draft);
    onChange(parsed);
    setDraft(formatDraftValue(parsed));
    setFocused(false);
  };

  return (
    <View
      className="s-travel-plan__node-price-wrap"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {focused ? (
        <View className="s-travel-plan__node-price-editor">
          <Text className="s-travel-plan__node-price-prefix" style={{ color: accent }}>
            ¥
          </Text>
          <Input
            className="s-travel-plan__node-price-input"
            style={{ color: accent }}
            type="digit"
            focus
            maxlength={7}
            value={draft}
            placeholder="0"
            placeholderClass="s-travel-plan__node-price-placeholder"
            confirmType="done"
            onInput={(event) => setDraft(event.detail.value ?? '')}
            onBlur={commitDraft}
            onConfirm={commitDraft}
          />
        </View>
      ) : (
        <View
          className="s-travel-plan__node-price-trigger"
          onClick={() => {
            setFocused(true);
            setDraft(formatDraftValue(value));
          }}
        >
          <Text
            className={[
              's-travel-plan__node-price',
              value == null ? 's-travel-plan__node-price--empty' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ color: accent }}
          >
            {value != null ? formatTravelPlanCost(value) : '¥—'}
          </Text>
        </View>
      )}
    </View>
  );
}
