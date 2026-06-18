import './AppealSettings.scss';
import Taro from '@tarojs/taro';
import { Button } from '../../../../components/ui';
import {
  SUPPORT_EMAIL,
  SUPPORT_FEEDBACK_HINT,
} from '../../../../constants/supportContact';
import { ROUTES, go } from '../../../../utils/route';
import { Text, View } from '@tarojs/components';

const FAQ = [
  {
    q: '为什么会突然被限制互动？',
    a: '常见原因包括：发布转票/加价出票、站外引流、重复灌水，或被多名用户举报为黄牛。AI 审核也可能误判，可通过下方流程申诉。',
  },
  {
    q: '限制多久会解除？',
    a: '限制到期后会自动恢复。具体解禁时间可在个人页或 AI 助手顶部的提示条中查看。',
  },
  {
    q: '如何申诉误伤？',
    a: '在帮助与反馈中说明情况并附上相关截图，我们会人工复核。',
  },
] as const;

export function AppealSettings() {
  const openHelp = () => {
    go(`${ROUTES.SETTINGS}?section=help`);
  };

  const copyEmail = () => {
    void Taro.setClipboardData({
      data: SUPPORT_EMAIL,
      success: () => {
        void Taro.showToast({ title: '邮箱已复制', icon: 'success' });
      },
    });
  };

  return (
    <View className="s-appeal-settings">
      <View className="s-appeal-settings__banner">
        <Text className="s-appeal-settings__banner-title">误伤申诉说明</Text>
        <Text className="s-appeal-settings__banner-desc">
          平台依据内容审核与用户举报对账号采取临时限制。若你认为是误判，可按以下步骤申诉。
        </Text>
      </View>

      <View className="s-settings__card s-appeal-settings__steps">
        <Text className="s-appeal-settings__section-title">申诉步骤</Text>
        <Text className="s-appeal-settings__step">
          1. 回顾近期在 AI 对话、发帖与评论等场景的发言是否含违规表述
        </Text>
        <Text className="s-appeal-settings__step">2. {SUPPORT_FEEDBACK_HINT}</Text>
        <Text className="s-appeal-settings__step">
          3. 我们将在 1–3 个工作日内复核，结果通过站内通知或你留下的联系方式反馈
        </Text>
      </View>

      <View className="s-settings__card s-appeal-settings__faq">
        {FAQ.map((item) => (
          <View key={item.q} className="s-appeal-settings__faq-item">
            <Text className="s-appeal-settings__faq-q">{item.q}</Text>
            <Text className="s-appeal-settings__faq-a">{item.a}</Text>
          </View>
        ))}
      </View>

      <Button className="s-settings__feedback-btn" onClick={openHelp}>
        <Text className="s-btn-label">前往帮助与反馈</Text>
      </Button>
      <Button className="s-appeal-settings__copy-btn" onClick={copyEmail}>
        <Text className="s-btn-label">复制客服邮箱</Text>
      </Button>
    </View>
  );
}
