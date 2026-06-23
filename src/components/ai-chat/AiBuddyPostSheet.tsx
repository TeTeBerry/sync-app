import './AiGuidePlanSheet.scss';
import './AiBuddyPostSheet.scss';
import { Send, Users, X } from '../../components/icons';
import { Button, cn } from '../ui';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import type {
  AiBuddyPostFormValues,
  AiBuddyPostSubmitPayload,
} from '../../types/buddyPost';
import { buildBuddyPostQuotaHint } from '../../utils/buddyPostQuota';
import { BuddyPostFeedSyncToggle } from './BuddyPostFeedSyncToggle';
import { BuddyPostSheetFormFields } from './BuddyPostSheetFormFields';
import { useBuddyPostSheetForm } from './useBuddyPostSheetForm';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type AiBuddyPostSheetProps = {
  open: boolean;
  activityDate?: string;
  activityTitle?: string;
  /** Activity host city — biases location POI suggestions. */
  eventCity?: string;
  initialValues?: AiBuddyPostFormValues | null;
  /** Shown when opened via travel-guide「一键组队」等预填流程。 */
  prefillSummaryLines?: string[] | null;
  prefillBannerTitle?: string | null;
  submitLabel?: string | null;
  sheetTitle?: string | null;
  /** Apply-team flow: let user choose whether the post appears on the activity feed. */
  showSyncToFeedOption?: boolean;
  postQuota?: { used: number; max: number; remaining: number; atLimit: boolean };
  onClose: () => void;
  onSubmit: (values: AiBuddyPostSubmitPayload) => void | Promise<void>;
};

export function AiBuddyPostSheet({
  open,
  activityDate,
  activityTitle: _activityTitle,
  eventCity,
  initialValues,
  prefillSummaryLines = null,
  prefillBannerTitle = null,
  submitLabel = null,
  sheetTitle = null,
  showSyncToFeedOption = false,
  postQuota,
  onClose,
  onSubmit,
}: AiBuddyPostSheetProps) {
  const t = useT();
  useOverlayLock(open);

  const form = useBuddyPostSheetForm({
    open,
    activityDate,
    initialValues,
    showSyncToFeedOption,
    onSubmit,
  });

  if (!open) return null;

  return (
    <View
      className="s-overlay s-overlay--sheet s-ai-guide-plan-sheet s-ai-buddy-post-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-ai-guide-plan-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-buddy-post-sheet-title"
      >
        <View className="s-ai-guide-plan-sheet__handle" aria-hidden />
        <View className="s-ai-guide-plan-sheet__top">
          <View className="s-ai-guide-plan-sheet__title-row">
            <View className="s-ai-guide-plan-sheet__title-icon" aria-hidden>
              <Users size={16} color="#fff" aria-hidden />
            </View>
            <Text
              id="ai-buddy-post-sheet-title"
              className="s-ai-guide-plan-sheet__title"
            >
              {sheetTitle?.trim() || t('ai.buddyPostSheetTitle')}
            </Text>
          </View>
          <Button
            className="s-ai-guide-plan-sheet__close"
            hoverClass="s-ai-guide-plan-sheet__close--pressed"
            aria-label={t('ai.close')}
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={form.scrollTop}
          className="s-ai-guide-plan-sheet__scroll s-scrollbar-none"
        >
          <BuddyPostSheetFormFields
            form={form}
            eventCity={eventCity}
            sheetOpen={open}
            prefillSummaryLines={prefillSummaryLines}
            prefillBannerTitle={prefillBannerTitle}
          />
        </ScrollView>

        <View className="s-ai-guide-plan-sheet__footer">
          {showSyncToFeedOption ? (
            <View className="s-ai-buddy-post-sheet__sync-row">
              <View className="s-ai-buddy-post-sheet__sync-copy">
                <Text className="s-ai-buddy-post-sheet__sync-label">
                  {t('ai.syncToFeed')}
                </Text>
                <Text className="s-ai-buddy-post-sheet__sync-hint">
                  {t('ai.syncToFeedHint')}
                </Text>
              </View>
              <BuddyPostFeedSyncToggle
                checked={form.syncToPostList}
                onChange={form.setSyncToPostList}
              />
            </View>
          ) : null}
          {postQuota ? (
            <Text className="s-ai-buddy-post-sheet__quota-hint">
              {buildBuddyPostQuotaHint(postQuota)}
            </Text>
          ) : null}
          <Button
            className={cn(
              's-ai-guide-plan-sheet__submit',
              (!form.canSubmit || form.isSubmitting) &&
                's-ai-guide-plan-sheet__submit--disabled',
            )}
            disabled={!form.canSubmit || form.isSubmitting}
            hoverClass={
              form.canSubmit && !form.isSubmitting
                ? 's-ai-guide-plan-sheet__submit--pressed'
                : ''
            }
            onClick={form.handleSubmit}
          >
            <Send size={17} color="#fff" aria-hidden />
            <Text className="s-ai-guide-plan-sheet__submit-text">
              {showSyncToFeedOption
                ? t('ai.save')
                : submitLabel?.trim() || t('ai.publishBuddyPost')}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
