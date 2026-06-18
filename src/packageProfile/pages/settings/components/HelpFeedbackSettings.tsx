import Taro from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { Text, Textarea, View } from '@tarojs/components';
import {
  GENERATE_TRAVEL_GUIDE_CTA,
  TRAVEL_GUIDE_TITLE,
} from '../../../../constants/aiCtaLabels';
import { submitUserFeedback } from '../../../../api/sync/feedback';
import { isLiveApi } from '../../../../constants/api';
import { isLoggedIn } from '../../../../utils/authStorage';
import { Button } from '../../../../components/ui';
import { useOverlayLock } from '../../../../hooks/useOverlayLock';

const FAQ_QA = [
  {
    q: `如何使用${TRAVEL_GUIDE_TITLE}？`,
    a: `进入活动详情或 AI 助手，点「${GENERATE_TRAVEL_GUIDE_CTA}」或描述出发地、人数、预算，即可生成交通/住宿/散场建议。`,
  },
  {
    q: '如何查看活动信息？',
    a: '在首页或活动 Tab 浏览电音节，进入活动详情可查看阵容、报名与行程入口。',
  },
  {
    q: '如何提升个人影响力？',
    a: '参与活动、完善个人资料、使用 AI 攻略与结伴互动等功能，可获得更好的活动体验。',
  },
] as const;

const CONTENT_MIN = 5;
const CONTENT_MAX = 1000;

export function HelpFeedbackSettings() {
  const [formOpen, setFormOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useOverlayLock(formOpen);

  const openForm = useCallback(() => {
    if (!isLiveApi() || isLoggedIn()) {
      setFormOpen(true);
      return;
    }
    void Taro.showToast({ title: '请先登录后再提交反馈', icon: 'none' });
  }, []);

  const closeForm = useCallback(() => {
    if (submitting) return;
    setFormOpen(false);
    setContent('');
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
        await submitUserFeedback({ content: trimmed });
      }
      void Taro.showToast({ title: '反馈已提交，感谢！', icon: 'success' });
      setContent('');
      setFormOpen(false);
    } catch {
      void Taro.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  }, [content]);

  return (
    <View className="s-settings-help">
      <View className="s-settings__card s-settings__faq">
        {FAQ_QA.map((item, idx) => (
          <View key={idx} className="s-settings__faq-item">
            <View className="s-settings__faq-q">{item.q}</View>
            <View className="s-settings__faq-a">{item.a}</View>
          </View>
        ))}
      </View>

      <View className="s-settings-help__action">
        {!formOpen ? (
          <Button className="s-settings__feedback-btn" onClick={openForm}>
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
    </View>
  );
}
