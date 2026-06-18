import { Users } from '../../components/icons';
import { PlaceAutocompleteField } from './PlaceAutocompleteField';
import { BuddyPostDateRangeField } from './BuddyPostDateRangeField';
import { Input, Text, Textarea, View } from '@tarojs/components';
import type { useBuddyPostSheetForm } from './useBuddyPostSheetForm';

type BuddyPostSheetFormFieldsProps = {
  form: ReturnType<typeof useBuddyPostSheetForm>;
  eventCity?: string;
  sheetOpen: boolean;
  prefillSummaryLines?: string[] | null;
  prefillBannerTitle?: string | null;
};

export function BuddyPostSheetFormFields({
  form,
  eventCity,
  sheetOpen,
  prefillSummaryLines = null,
  prefillBannerTitle = null,
}: BuddyPostSheetFormFieldsProps) {
  return (
    <View className="s-ai-guide-plan-sheet__body">
      {prefillSummaryLines?.length ? (
        <View className="s-ai-buddy-post-sheet__prefill-banner">
          <Text className="s-ai-buddy-post-sheet__prefill-title">
            {prefillBannerTitle?.trim() || '已从攻略预填'}
          </Text>
          <Text className="s-ai-buddy-post-sheet__prefill-desc">
            {prefillSummaryLines.join(' · ')}。请确认日期、集合点与备注后发布。
          </Text>
        </View>
      ) : null}

      <BuddyPostDateRangeField
        dateStart={form.dateStart}
        dateEnd={form.dateEnd}
        onDateStartChange={form.setDateStart}
        onDateEndChange={form.setDateEnd}
      />

      <PlaceAutocompleteField
        label="集合点"
        labelClassName="s-ai-buddy-post-sheet__label"
        hint="请填写具体集合点（场馆门口、地铁口、酒店大堂等），不要只写城市名"
        value={form.location}
        onChange={form.setLocation}
        placeholder="如 A 馆北门、XX 地铁站 1 号口"
        eventCity={eventCity}
        active={sheetOpen}
        placesOnly
      />

      <View className="s-ai-guide-plan-sheet__field">
        <Text className="s-ai-buddy-post-sheet__label">人数</Text>
        <View className="s-ai-guide-plan-sheet__input-wrap">
          <Users size={18} className="s-ai-guide-plan-sheet__input-icon" aria-hidden />
          <Input
            className="s-ai-guide-plan-sheet__input"
            type="text"
            value={form.headcount}
            placeholder="如 2人、2-3人"
            placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
            onInput={(e) => form.setHeadcount(e.detail.value ?? '')}
          />
        </View>
      </View>

      <View className="s-ai-guide-plan-sheet__field s-ai-buddy-post-sheet__field--note">
        <Text className="s-ai-buddy-post-sheet__label">备注（可选）</Text>
        <View className="s-ai-buddy-post-sheet__textarea-wrap">
          <Textarea
            className="s-ai-buddy-post-sheet__textarea"
            value={form.note}
            maxlength={form.noteMaxLength}
            placeholder="性别偏好、喜欢音乐风格、其他说明…"
            placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
            onInput={(e) => form.setNote(e.detail.value ?? '')}
          />
          <Text className="s-ai-buddy-post-sheet__note-count" aria-hidden>
            {form.note.length}/{form.noteMaxLength}
          </Text>
        </View>
      </View>
    </View>
  );
}
