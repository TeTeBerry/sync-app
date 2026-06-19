import Taro from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { Text, Textarea, View } from '@tarojs/components';
import { Button } from '../../../../components/ui';
import {
  GENERATE_TRAVEL_GUIDE_CTA,
  TRAVEL_GUIDE_TITLE,
} from '../../../../constants/aiCtaLabels';
import { submitUserFeedback } from '../../../../api/sync/feedback';
import { isLiveApi } from '../../../../constants/api';
import { isLoggedIn } from '../../../../utils/authStorage';
import { useOverlayLock } from '../../../../hooks/useOverlayLock';
import { clearAllLocalUserData } from '../../../../utils/clearAllLocalUserData';
import { SUPPORT_EMAIL } from '../../../../constants/supportContact';
import { AccountDeletionGuide } from '@/packageProfile/pages/settings/components/AccountDeletionGuide';

const SHOW_DEV_RESET = process.env.NODE_ENV !== 'production';

const FAQ_QA = [
  {
    q: `如何使用${TRAVEL_GUIDE_TITLE}？`,
    a: `进入活动详情或 AI 助手，点「${GENERATE_TRAVEL_GUIDE_CTA}」或描述出发地、人数、预算，即可生成交通/住宿/散场建议。`,
  },
  {
    q: '如何查看活动信息？',
    a: '在首页或活动 Tab 浏览电音节，进入活动详情可查看阵容、行程与结伴入口。',
  },
  {
    q: '如何提升个人影响力？',
    a: '参与活动、完善个人资料、使用 AI 攻略与结伴互动等功能，可获得更好的活动体验。',
  },
] as const;

const CONTENT_MIN = 5;
const CONTENT_MAX = 1000;

const FEEDBACK_SUCCESS_HINT =
  '我们将在合理期限内通过邮箱或站内通知回复，不承诺具体响应时间。';

type FeedbackSuccessState = {
  id: string;
  submittedAt: string;
};

export function HelpFeedbackSettings() {
  const [formOpen, setFormOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState<FeedbackSuccessState | null>(null);
  const [deletionPrefill, setDeletionPrefill] = useState(false);

  useOverlayLock(formOpen);

  const openForm = useCallback((options?: { accountDeletion?: boolean }) => {
    if (!isLiveApi() || isLoggedIn()) {
      setDeletionPrefill(options?.accountDeletion ?? false);
      if (options?.accountDeletion) {
        setContent('申请删除账号与全部个人数据');
      }
      setFormOpen(true);
      return;
    }
    void Taro.showToast({ title: '请先登录后再提交反馈', icon: 'none' });
  }, []);

  const closeForm = useCallback(() => {
    if (submitting) return;
    setFormOpen(false);
    setContent('');
    setDeletionPrefill(false);
  }, [submitting]);

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (trimmed.length < CONTENT_MIN) {
      void Taro.showToast({
        title: `请至少输入 ${CONTENT_MIN} 个字`,
        icon: 'none',
      });
      return;
    }

    if (isLiveApi() && !isLoggedIn()) {
      void Taro.showToast({ title: '请先登录后再提交反馈', icon: 'none' });
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
          submittedAt: new Date().toLocaleString('zh-CN', {
            hour12: false,
          }),
        });
      } else {
        setSuccess({
          id: 'local-preview',
          submittedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        });
      }
      setContent('');
      setFormOpen(false);
      setDeletionPrefill(false);
    } catch {
      void Taro.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  }, [content, deletionPrefill]);

  const handleResetLocalData = useCallback(() => {
    void Taro.showModal({
      title: '重置本地数据',
      content:
        '将清空登录状态、协议勾选、首页缓存、人格测试结果等全部本地数据，并回到首页。仅用于新用户测试，是否继续？',
      confirmText: '清空并重开',
      confirmColor: '#ff0066',
      success: (result) => {
        if (!result.confirm) {
          return;
        }
        setResetting(true);
        void clearAllLocalUserData()
          .catch(() => {
            void Taro.showToast({ title: '重置失败，请稍后重试', icon: 'none' });
          })
          .finally(() => {
            setResetting(false);
          });
      },
    });
  }, []);

  return (
    <View className="s-settings-help">
      <AccountDeletionGuide
        onStartDeletionFeedback={() => openForm({ accountDeletion: true })}
      />

      <View className="s-settings__card s-settings__faq">
        {FAQ_QA.map((item, idx) => (
          <View key={idx} className="s-settings__faq-item">
            <View className="s-settings__faq-q">{item.q}</View>
            <View className="s-settings__faq-a">{item.a}</View>
          </View>
        ))}
      </View>

      {success ? (
        <View className="s-settings-help__success" aria-label="反馈提交成功">
          <Text className="s-settings-help__success-title">反馈已提交</Text>
          <Text className="s-settings-help__success-meta">编号：{success.id}</Text>
          <Text className="s-settings-help__success-meta">
            时间：{success.submittedAt}
          </Text>
          <Text className="s-settings-help__success-hint">{FEEDBACK_SUCCESS_HINT}</Text>
          <Text className="s-settings-help__success-hint">
            联系邮箱：{SUPPORT_EMAIL}
          </Text>
          <Button
            className="s-settings__feedback-btn s-settings-help__success-btn"
            onClick={() => {
              setSuccess(null);
              openForm();
            }}
          >
            <Text className="s-btn-label">继续提交反馈</Text>
          </Button>
        </View>
      ) : null}

      <View className="s-settings-help__action">
        {!formOpen ? (
          <Button className="s-settings__feedback-btn" onClick={() => openForm()}>
            <Text className="s-btn-label">提交反馈</Text>
          </Button>
        ) : (
          <View className="s-settings-help__form">
            <Text className="s-settings-help__form-label">描述你遇到的问题或建议</Text>
            <View className="s-settings-help__textarea-wrap">
              <Textarea
                className="s-settings-help__textarea"
                value={content}
                maxlength={CONTENT_MAX}
                placeholder="例如：活动页加载慢、攻略生成异常、希望增加某功能…"
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
                <Text className="s-btn-label">取消</Text>
              </Button>
              <Button
                className="s-settings-help__btn s-settings-help__btn--primary"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                <Text className="s-btn-label">{submitting ? '提交中…' : '提交'}</Text>
              </Button>
            </View>
          </View>
        )}
      </View>

      {SHOW_DEV_RESET ? (
        <View className="s-settings-help__dev">
          <Text className="s-settings-help__dev-title">开发测试</Text>
          <Text className="s-settings-help__dev-desc">
            模拟首次打开小程序：清空本地 storage
            与内存缓存（不影响服务端账号，除非已调用退出登录）。
          </Text>
          <Button
            className="s-settings-help__dev-btn"
            disabled={resetting}
            onClick={handleResetLocalData}
          >
            <Text className="s-btn-label">
              {resetting ? '重置中…' : '重置本地数据（新用户测试）'}
            </Text>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
