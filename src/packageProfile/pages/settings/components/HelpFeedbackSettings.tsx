import './HelpFeedbackSettings.scss';
import { useCallback, useMemo, useState } from 'react';
import { Text, Textarea, View } from '@tarojs/components';
import { Button } from '../../../../components/ui';
import { useT } from '@/hooks/useI18n';
import { submitUserFeedback } from '../../../../api/sync/feedback';
import { isLiveApi } from '../../../../constants/api';
import { isLoggedIn } from '../../../../utils/authStorage';
import { useOverlayLock } from '../../../../hooks/useOverlayLock';
import { SUPPORT_EMAIL } from '../../../../constants/supportContact';
import { AccountDeletionGuide } from '@/packageProfile/pages/settings/components/AccountDeletionGuide';
import { showAppToast } from '@/utils/appToast';

const CONTENT_MIN = 5;
const CONTENT_MAX = 1000;

type FeedbackSuccessState = {
  id: string;
  submittedAt: string;
};

export function HelpFeedbackSettings() {
  const t = useT();

  const faqItems = useMemo(
    () => [
      {
        q: t('feedback.faq.travelGuideQ', { title: t('ai.travelGuideTitle') }),
        a: t('feedback.faq.travelGuideA', { cta: t('ai.generateTravelGuide') }),
      },
      {
        q: t('feedback.faq.viewEventQ'),
        a: t('feedback.faq.viewEventA'),
      },
      {
        q: t('feedback.faq.influenceQ'),
        a: t('feedback.faq.influenceA'),
      },
    ],
    [t],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<FeedbackSuccessState | null>(null);
  const [deletionPrefill, setDeletionPrefill] = useState(false);

  useOverlayLock(formOpen);

  const openForm = useCallback(
    (options?: { accountDeletion?: boolean }) => {
      if (!isLiveApi() || isLoggedIn()) {
        setDeletionPrefill(options?.accountDeletion ?? false);
        if (options?.accountDeletion) {
          setContent(t('accountDeletion.submitDeletion'));
        }
        setFormOpen(true);
        return;
      }
      showAppToast('auth.feedbackLoginRequired', { icon: 'none' });
    },
    [t],
  );

  const closeForm = useCallback(() => {
    if (submitting) return;
    setFormOpen(false);
    setContent('');
    setDeletionPrefill(false);
  }, [submitting]);

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (trimmed.length < CONTENT_MIN) {
      showAppToast('feedback.minLengthError', {
        params: { min: CONTENT_MIN },
        icon: 'none',
      });
      return;
    }

    if (isLiveApi() && !isLoggedIn()) {
      showAppToast('auth.feedbackLoginRequired', { icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      if (isLiveApi()) {
        const result = await submitUserFeedback({
          content: trimmed,
          type: deletionPrefill ? 'account_deletion' : 'general',
        });
        setSuccess({
          id: result.id,
          submittedAt: new Date().toLocaleString(
            t('common.locale') === 'zh-CN' ? 'zh-CN' : 'en-US',
            { hour12: false },
          ),
        });
      } else {
        setSuccess({
          id: 'local-preview',
          submittedAt: new Date().toLocaleString(
            t('common.locale') === 'zh-CN' ? 'zh-CN' : 'en-US',
            { hour12: false },
          ),
        });
      }
      setContent('');
      setFormOpen(false);
      setDeletionPrefill(false);
    } catch {
      showAppToast('common.requestFailed', { icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  }, [content, deletionPrefill, t]);

  return (
    <View className="s-settings-help">
      <AccountDeletionGuide
        onStartDeletionFeedback={() => openForm({ accountDeletion: true })}
      />

      <View className="s-settings-help__section">
        <Text className="s-settings-help__section-title">{t('feedback.faqTitle')}</Text>
        <View className="s-settings__card s-settings-help__faq">
          {faqItems.map((item, idx) => (
            <View key={idx} className="s-settings-help__faq-item">
              <View className="s-settings-help__faq-q">{item.q}</View>
              <View className="s-settings-help__faq-a">{item.a}</View>
            </View>
          ))}
        </View>
      </View>

      {success ? (
        <View
          className="s-settings-help__success"
          aria-label={t('feedback.successTitle')}
        >
          <Text className="s-settings-help__success-title">
            {t('feedback.successTitle')}
          </Text>
          <Text className="s-settings-help__success-meta">
            {t('feedback.successId', { id: success.id })}
          </Text>
          <Text className="s-settings-help__success-meta">
            {t('feedback.successTime', { time: success.submittedAt })}
          </Text>
          <Text className="s-settings-help__success-hint">
            {t('feedback.successHint')}
          </Text>
          <Text className="s-settings-help__success-hint">
            {t('feedback.successEmail', { email: SUPPORT_EMAIL })}
          </Text>
          <Button
            className="s-settings-help__feedback-btn s-settings-help__success-btn"
            onClick={() => {
              setSuccess(null);
              openForm();
            }}
          >
            <Text className="s-btn-label">{t('feedback.continueSubmit')}</Text>
          </Button>
        </View>
      ) : null}

      <View className="s-settings-help__action">
        {!formOpen ? (
          <Button className="s-settings-help__feedback-btn" onClick={() => openForm()}>
            <Text className="s-btn-label">{t('feedback.submit')}</Text>
          </Button>
        ) : (
          <View className="s-settings-help__form">
            <Text className="s-settings-help__form-label">
              {t('feedback.formLabel')}
            </Text>
            <View className="s-settings-help__textarea-wrap">
              <Textarea
                className="s-settings-help__textarea"
                value={content}
                maxlength={CONTENT_MAX}
                placeholder={t('feedback.formPlaceholder')}
                placeholderStyle="color: rgba(255,255,255,0.28)"
                disabled={submitting}
                focus
                onInput={(e) => setContent(e.detail.value ?? '')}
              />
              <Text className="s-settings-help__count" aria-hidden>
                {content.length}/{CONTENT_MAX}
              </Text>
            </View>
            <View className="s-settings-help__form-actions">
              <Button
                className="s-settings-help__btn s-settings-help__btn--ghost"
                disabled={submitting}
                onClick={closeForm}
              >
                <Text className="s-btn-label">{t('feedback.cancel')}</Text>
              </Button>
              <Button
                className="s-settings-help__btn s-settings-help__btn--primary"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                <Text className="s-btn-label">
                  {submitting ? t('feedback.submitLoading') : t('feedback.submit')}
                </Text>
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
