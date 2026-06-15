import { Input, Picker, Text, View } from '@tarojs/components';
import { ChevronDown, Trash2 } from '@/components/icons';
import { Button } from '@/components/ui';
import type {
  TravelPlanAddFormCategory,
  TravelPlanAddFormValues,
} from '../utils/travelPlanAddForm';
import { TravelPlanDateTimeRangeField } from './TravelPlanDateTimeRangeField';

const SEGMENT_TYPE_OPTIONS: Array<{
  id: TravelPlanAddFormCategory;
  label: string;
}> = [
  { id: 'transport', label: '交通' },
  { id: 'hotel', label: '住宿' },
  { id: 'dining', label: '餐饮' },
  { id: 'event', label: '活动' },
];

const SEGMENT_CATEGORY_LABEL: Record<TravelPlanAddFormCategory, string> = {
  transport: '交通',
  hotel: '住宿',
  dining: '餐饮',
  event: '活动',
};

type TravelPlanAddSheetSegmentProps = {
  index: number;
  total: number;
  form: TravelPlanAddFormValues;
  sheetOpen: boolean;
  onPatch: (patch: Partial<TravelPlanAddFormValues>) => void;
  onRemove?: () => void;
  batchMode?: boolean;
};

function resolveSegmentLabel(
  index: number,
  total: number,
  category: TravelPlanAddFormCategory,
  batchMode: boolean,
) {
  if (total <= 1) {
    return null;
  }
  if (batchMode) {
    return `${SEGMENT_CATEGORY_LABEL[category]} ${index + 1}`;
  }
  if (category === 'transport' && total === 2) {
    return index === 0 ? '去程' : '返程';
  }
  return `第 ${index + 1} 段`;
}

function isBillStyleSegment(
  category: TravelPlanAddFormCategory,
  batchMode: boolean,
): boolean {
  if (!batchMode) {
    return false;
  }
  return category === 'dining' || category === 'transport';
}

export function TravelPlanAddSheetSegment({
  index,
  total,
  form,
  sheetOpen,
  onPatch,
  onRemove,
  batchMode = false,
}: TravelPlanAddSheetSegmentProps) {
  const category = form.category;
  const billStyle = isBillStyleSegment(category, batchMode);
  const segmentLabel = resolveSegmentLabel(index, total, category, batchMode);
  const categoryIndex = Math.max(
    0,
    SEGMENT_TYPE_OPTIONS.findIndex((option) => option.id === category),
  );

  return (
    <View className="s-travel-plan-add-sheet__segment">
      {segmentLabel ? (
        <View className="s-travel-plan-add-sheet__segment-head">
          <Text className="s-travel-plan-add-sheet__segment-title">{segmentLabel}</Text>
          <View className="s-travel-plan-add-sheet__segment-head-actions">
            <Text className="s-travel-plan-add-sheet__segment-index">
              {index + 1}/{total}
            </Text>
            {onRemove ? (
              <Button
                className="s-travel-plan-add-sheet__segment-remove"
                hoverClass="s-travel-plan-add-sheet__segment-remove--pressed"
                aria-label={`删除${segmentLabel}`}
                onClick={onRemove}
              >
                <Trash2 size={14} color="#ff453a" aria-hidden />
              </Button>
            ) : null}
          </View>
        </View>
      ) : null}

      {batchMode ? (
        <View className="s-travel-plan-add-sheet__field">
          <Text className="s-travel-plan-add-sheet__field-label">类型</Text>
          <Picker
            mode="selector"
            range={SEGMENT_TYPE_OPTIONS.map((option) => option.label)}
            value={categoryIndex}
            onChange={(event) => {
              const next =
                SEGMENT_TYPE_OPTIONS[Number(event.detail.value)]?.id ?? category;
              onPatch({ category: next });
            }}
          >
            <View className="s-travel-plan-add-sheet__segment-select">
              <Text className="s-travel-plan-add-sheet__segment-select-value">
                {SEGMENT_CATEGORY_LABEL[category]}
              </Text>
              <ChevronDown size={16} color="#8e8e93" aria-hidden />
            </View>
          </Picker>
        </View>
      ) : null}

      <View className="s-travel-plan-add-sheet__field s-travel-plan-add-sheet__field--time">
        <Text className="s-travel-plan-add-sheet__field-label">时间</Text>
        <TravelPlanDateTimeRangeField
          sheetOpen={sheetOpen}
          value={form.timeRange}
          onChange={(timeRange) => onPatch({ timeRange })}
        />
      </View>

      <View className="s-travel-plan-add-sheet__field">
        <Text className="s-travel-plan-add-sheet__field-label">
          {billStyle && category === 'dining'
            ? '商家'
            : billStyle && category === 'transport'
              ? '行程摘要'
              : '标题'}
        </Text>
        <Input
          className="s-travel-plan-add-sheet__input"
          type="text"
          value={form.title}
          placeholder={
            billStyle && category === 'dining'
              ? '如：星巴克'
              : billStyle && category === 'transport'
                ? '如：滴滴出行'
                : '如：乘高铁去深圳'
          }
          placeholderClass="s-travel-plan-add-sheet__input-placeholder"
          confirmType="done"
          onInput={(event) => onPatch({ title: event.detail.value ?? '' })}
        />
      </View>

      <View className="s-travel-plan-add-sheet__grid s-travel-plan-add-sheet__grid--desc-cost">
        <View className="s-travel-plan-add-sheet__field">
          <Text className="s-travel-plan-add-sheet__field-label">
            {billStyle ? '消费时间（选填）' : '描述（选填）'}
          </Text>
          <Input
            className="s-travel-plan-add-sheet__input"
            type="text"
            value={form.description}
            placeholder={billStyle ? '如：6/15 13:53' : '如：G1222次 · 二等座'}
            placeholderClass="s-travel-plan-add-sheet__input-placeholder"
            confirmType="done"
            onInput={(event) => onPatch({ description: event.detail.value ?? '' })}
          />
        </View>
        <View className="s-travel-plan-add-sheet__field">
          <Text className="s-travel-plan-add-sheet__field-label">费用</Text>
          <Input
            className="s-travel-plan-add-sheet__input"
            type="digit"
            value={form.cost}
            placeholder="¥200"
            placeholderClass="s-travel-plan-add-sheet__input-placeholder"
            confirmType="done"
            onInput={(event) => onPatch({ cost: event.detail.value ?? '' })}
          />
        </View>
      </View>

      <View className="s-travel-plan-add-sheet__field">
        <Text className="s-travel-plan-add-sheet__field-label">备注（选填）</Text>
        <Input
          className="s-travel-plan-add-sheet__input"
          type="text"
          value={form.remark}
          placeholder="如：预订号 / 注意事项"
          placeholderClass="s-travel-plan-add-sheet__input-placeholder"
          confirmType="done"
          onInput={(event) => onPatch({ remark: event.detail.value ?? '' })}
        />
      </View>
    </View>
  );
}
