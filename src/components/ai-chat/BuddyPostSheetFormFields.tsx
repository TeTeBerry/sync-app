import { Users } from '../../components/icons';
import { PlaceAutocompleteField } from './PlaceAutocompleteField';
import { BuddyPostDateRangeField } from './BuddyPostDateRangeField';
import { Input, Text, Textarea, View } from '@tarojs/components';
import type { useBuddyPostSheetForm } from './useBuddyPostSheetForm';
import { useT } from '@/hooks/useI18n';

type BuddyPostSheetFormFieldsProps = {
  form: ReturnType<typeof useBuddyPostSheetForm>;
  eventCity?: string;
  sheetOpen: boolean;
  prefillSummaryLines?: string[] | null;
  prefillBannerTitle?: string | null;
  hideNote?: boolean;
};

export function BuddyPostSheetFormFields({
  form,
  eventCity,
  sheetOpen,
  prefillSummaryLines = null,
  prefillBannerTitle = null,
  hideNote = false,
}: BuddyPostSheetFormFieldsProps) {
  const t = useT();
  return (
    <View className="s-ai-guide-plan-sheet__body">
      {prefillSummaryLines?.length ? (
        <View className="s-ai-buddy-post-sheet__prefill-banner">
          <Text className="s-ai-buddy-post-sheet__prefill-title">
            {prefillBannerTitle?.trim() || t('posts.prefillBannerTitle')}
          </Text>
          <Text className="s-ai-buddy-post-sheet__prefill-desc">
            {t('posts.prefillDesc', { summary: prefillSummaryLines.join(' · ') })}
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
        label={t('posts.locationLabel')}
        labelClassName="s-ai-buddy-post-sheet__label"
        hint={t('posts.locationHint')}
        value={form.location}
        onChange={form.setLocation}
        placeholder={t('posts.locationPlaceholder')}
        eventCity={eventCity}
        active={sheetOpen}
        placesOnly
      />

      <View className="s-ai-guide-plan-sheet__field">
        <Text className="s-ai-buddy-post-sheet__label">
          {t('posts.headcountLabel')}
        </Text>
        <View className="s-ai-guide-plan-sheet__input-wrap">
          <View className="s-ai-guide-plan-sheet__input-icon-wrap" aria-hidden>
            <Users size={16} className="s-ai-guide-plan-sheet__input-icon" />
          </View>
          <Input
            className="s-ai-guide-plan-sheet__input"
            type="text"
            value={form.headcount}
            placeholder={t('posts.headcountPlaceholder')}
            placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
            onInput={(e) => form.setHeadcount(e.detail.value ?? '')}
          />
        </View>
      </View>

      {!hideNote ? (
        <View className="s-ai-guide-plan-sheet__field s-ai-buddy-post-sheet__field--note">
          <View className="s-ai-buddy-post-sheet__label-row">
            <Text className="s-ai-buddy-post-sheet__label">{t('posts.noteLabel')}</Text>
            <Text className="s-ai-buddy-post-sheet__optional-tag">
              {t('posts.noteOptional')}
            </Text>
          </View>
          <View className="s-ai-buddy-post-sheet__textarea-wrap">
            <Textarea
              className="s-ai-buddy-post-sheet__textarea"
              value={form.note}
              maxlength={form.noteMaxLength}
              placeholder={t('posts.notePlaceholder')}
              placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
              onInput={(e) => form.setNote(e.detail.value ?? '')}
            />
            <Text className="s-ai-buddy-post-sheet__note-count" aria-hidden>
              {form.note.length}/{form.noteMaxLength}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
