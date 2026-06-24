import './AiGuidePlanSheet.scss';
import './AiBuddyPostSheet.scss';
import { useCallback, useMemo } from 'react';
import { ChevronLeft, Send, Sparkles, Users, X } from '../../components/icons';

const COMPOSE_HEADER_ICON_COLOR = '#4cc9f0';
import { Button, cn } from '../ui';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import type {
  AiBuddyPostFormValues,
  AiBuddyPostSubmitPayload,
} from '../../types/buddyPost';
import { buildBuddyPostQuotaHint } from '../../utils/buddyPostQuota';
import { buildBuddyPostComposeHints } from '@/utils/buildBuddyPostComposeHints';
import { buildOptimisticBuddyPost } from '@/utils/publishBuddyPost';
import { useDisplayUserIdentity } from '@/hooks/useDisplayUserIdentity';
import { BuddyPostFeedSyncToggle } from './BuddyPostFeedSyncToggle';
import { BuddyPostSheetFormFields } from './BuddyPostSheetFormFields';
import { BuddyPostComposeStep } from './BuddyPostComposeStep';
import { BuddyPostPreviewStep } from './BuddyPostPreviewStep';
import { useBuddyPostSheetForm } from './useBuddyPostSheetForm';
import { useBuddyPostSheetWizard } from './useBuddyPostSheetWizard';
import { useBuddyPostCompose } from './useBuddyPostCompose';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type AiBuddyPostSheetProps = {
  open: boolean;
  mode?: 'create' | 'edit';
  activityLegacyId?: number;
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
  mode = 'create',
  activityLegacyId,
  activityDate,
  activityTitle,
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
  const displayIdentity = useDisplayUserIdentity();
  const wizard = useBuddyPostSheetWizard({ open, mode });
  const compose = useBuddyPostCompose({ activityLegacyId });

  const form = useBuddyPostSheetForm({
    open,
    activityDate,
    initialValues,
    showSyncToFeedOption,
    onSubmit,
  });

  const composeHints = useMemo(
    () =>
      buildBuddyPostComposeHints({
        prefillBannerTitle,
        prefillSummaryLines,
        note: form.note,
      }),
    [form.note, prefillBannerTitle, prefillSummaryLines],
  );

  const previewPost = useMemo(() => {
    if (!wizard.isWizard || wizard.step !== 'preview') {
      return null;
    }
    return buildOptimisticBuddyPost({
      pendingId: 'preview',
      form: {
        dateStart: form.dateStart,
        dateEnd: form.dateEnd,
        location: form.location,
        headcount: form.headcount,
        tags: ['team'],
        note: form.note.trim() || undefined,
      },
      authorName: displayIdentity.name?.trim() || t('common.user'),
      authorAvatar: displayIdentity.avatar,
      authorHandle: displayIdentity.handle,
      location: form.location.trim(),
    });
  }, [
    displayIdentity.avatar,
    displayIdentity.handle,
    displayIdentity.name,
    form.dateEnd,
    form.dateStart,
    form.headcount,
    form.location,
    form.note,
    t,
    wizard.isWizard,
    wizard.step,
  ]);

  const handleGenerate = useCallback(async () => {
    await compose.generate({
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
      location: form.location.trim(),
      headcount: form.headcount.trim(),
      composeHints,
    });
  }, [
    compose,
    composeHints,
    form.dateEnd,
    form.dateStart,
    form.headcount,
    form.location,
  ]);

  const handleRegenerate = useCallback(async () => {
    await compose.generate(
      {
        dateStart: form.dateStart,
        dateEnd: form.dateEnd,
        location: form.location.trim(),
        headcount: form.headcount.trim(),
        composeHints,
      },
      { regenerate: true },
    );
  }, [
    compose,
    composeHints,
    form.dateEnd,
    form.dateStart,
    form.headcount,
    form.location,
  ]);

  const handlePrimaryAction = useCallback(async () => {
    if (!wizard.isWizard) {
      await form.handleSubmit();
      return;
    }
    if (wizard.step === 'form') {
      wizard.goNext();
      return;
    }
    if (wizard.step === 'compose') {
      wizard.goNext();
      return;
    }
    await form.handleSubmit();
  }, [form, wizard]);

  const primaryDisabled =
    wizard.step === 'form'
      ? !form.canSubmit || form.isSubmitting
      : wizard.step === 'compose'
        ? form.isSubmitting
        : !form.canSubmit || form.isSubmitting;

  const primaryLabel = !wizard.isWizard
    ? showSyncToFeedOption
      ? t('ai.save')
      : submitLabel?.trim() || t('ai.publishBuddyPost')
    : wizard.step === 'preview'
      ? submitLabel?.trim() || t('posts.confirmPublish')
      : t('posts.nextStep');

  const resolvedSheetTitle =
    sheetTitle?.trim() ||
    (wizard.isWizard && wizard.step === 'compose'
      ? t('posts.composeTitle')
      : wizard.isWizard && wizard.step === 'preview'
        ? t('posts.previewTitle')
        : t('ai.buddyPostSheetTitle'));

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
            {wizard.isWizard && wizard.step === 'compose' ? (
              <View className="s-ai-guide-plan-sheet__title-icon" aria-hidden>
                <Sparkles
                  size={16}
                  className="s-ai-guide-plan-sheet__title-icon-sparkle"
                  color={COMPOSE_HEADER_ICON_COLOR}
                  aria-hidden
                />
              </View>
            ) : wizard.isWizard && wizard.step !== 'form' ? (
              <Button
                className="s-ai-buddy-post-sheet__back"
                hoverClass="s-ai-buddy-post-sheet__back--pressed"
                aria-label={t('common.back')}
                onClick={wizard.goBack}
              >
                <ChevronLeft size={18} color="#fff" aria-hidden />
              </Button>
            ) : (
              <View className="s-ai-guide-plan-sheet__title-icon" aria-hidden>
                <Users size={16} aria-hidden />
              </View>
            )}
            <Text
              id="ai-buddy-post-sheet-title"
              className="s-ai-guide-plan-sheet__title"
            >
              {resolvedSheetTitle}
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

        {wizard.isWizard ? (
          <View className="s-ai-buddy-post-sheet__steps" aria-hidden>
            {(['form', 'compose', 'preview'] as const).map((item, index) => (
              <View
                key={item}
                className={cn(
                  's-ai-buddy-post-sheet__step',
                  wizard.step === item && 's-ai-buddy-post-sheet__step--active',
                  (['form', 'compose', 'preview'] as const).indexOf(wizard.step) >
                    index && 's-ai-buddy-post-sheet__step--done',
                )}
              />
            ))}
          </View>
        ) : null}

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={form.scrollTop}
          className="s-ai-guide-plan-sheet__scroll s-scrollbar-none"
        >
          {!wizard.isWizard || wizard.step === 'form' ? (
            <BuddyPostSheetFormFields
              form={form}
              eventCity={eventCity}
              sheetOpen={open}
              prefillSummaryLines={prefillSummaryLines}
              prefillBannerTitle={prefillBannerTitle}
              hideNote={wizard.isWizard}
            />
          ) : null}
          {wizard.isWizard && wizard.step === 'compose' ? (
            <BuddyPostComposeStep
              note={form.note}
              noteMaxLength={form.noteMaxLength}
              candidates={compose.candidates}
              disclaimer={compose.disclaimer}
              selectedId={compose.selectedId}
              loading={compose.loading}
              onNoteChange={form.setNote}
              onSelectCandidate={compose.setSelectedId}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
            />
          ) : null}
          {wizard.isWizard && wizard.step === 'preview' && previewPost ? (
            <BuddyPostPreviewStep post={previewPost} activityTitle={activityTitle} />
          ) : null}
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
              primaryDisabled && 's-ai-guide-plan-sheet__submit--disabled',
            )}
            disabled={primaryDisabled}
            hoverClass={
              !primaryDisabled ? 's-ai-guide-plan-sheet__submit--pressed' : ''
            }
            onClick={handlePrimaryAction}
          >
            <Send size={17} color="#fff" aria-hidden />
            <Text className="s-ai-guide-plan-sheet__submit-text">{primaryLabel}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
