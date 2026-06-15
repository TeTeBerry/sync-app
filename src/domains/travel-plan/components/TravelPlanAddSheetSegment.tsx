import { Input, Text, View } from '@tarojs/components';
import { Trash2 } from '@/components/icons';
import { Button } from '@/components/ui';
import type {
  TravelPlanAddFormCategory,
  TravelPlanAddFormValues,
} from '../utils/travelPlanAddForm';
import { TravelPlanDateTimeRangeField } from './TravelPlanDateTimeRangeField';

type TravelPlanAddSheetSegmentProps = {
  index: number;
  total: number;
  category: TravelPlanAddFormCategory;
  form: TravelPlanAddFormValues;
  sheetOpen: boolean;
  onPatch: (patch: Partial<TravelPlanAddFormValues>) => void;
  onRemove?: () => void;
  mergeAsBillList?: boolean;
};

function resolveSegmentLabel(
  index: number,
  total: number,
  category: TravelPlanAddFormCategory,
  mergeAsBillList: boolean,
) {
  if (total <= 1) {
    return null;
  }
  if (category === 'transport' && total === 2 && !mergeAsBillList) {
    return index === 0 ? '去程' : '返程';
  }
  if (category === 'dining') {
    return `账单 ${index + 1}`;
  }
  if (category === 'transport' && mergeAsBillList) {
    return `打车 ${index + 1}`;
  }
  return `第 ${index + 1} 段`;
}

export function TravelPlanAddSheetSegment({
  index,
  total,
  category,
  form,
  sheetOpen,
  onPatch,
  onRemove,
  mergeAsBillList = false,
}: TravelPlanAddSheetSegmentProps) {
  const segmentLabel = resolveSegmentLabel(index, total, category, mergeAsBillList);

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
          {category === 'dining'
            ? '商家'
            : category === 'transport' && mergeAsBillList
              ? '行程摘要'
              : '标题'}
        </Text>
        <Input
          className="s-travel-plan-add-sheet__input"
          type="text"
          value={form.title}
          placeholder={
            category === 'dining'
              ? '如：星巴克'
              : category === 'transport' && mergeAsBillList
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
            {category === 'dining' || (category === 'transport' && mergeAsBillList)
              ? '消费时间（选填）'
              : '描述（选填）'}
          </Text>
          <Input
            className="s-travel-plan-add-sheet__input"
            type="text"
            value={form.description}
            placeholder={
              category === 'dining' || (category === 'transport' && mergeAsBillList)
                ? '如：6/15 13:53'
                : '如：G1222次 · 二等座'
            }
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
