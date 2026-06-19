import Taro from '@tarojs/taro';
import { Text, View } from '@tarojs/components';
import { Button } from '../../../../components/ui';
import { SUPPORT_EMAIL } from '../../../../constants/supportContact';

const DELETION_DATA_SCOPE = [
  '账号与微信 openid 关联信息',
  '个人资料、报名记录与偏好设置',
  '你发布的组队帖、评论与 AI 对话记录',
  '行程、攻略、性格测试等工具内数据',
] as const;

type AccountDeletionGuideProps = {
  onStartDeletionFeedback: () => void;
};

export function AccountDeletionGuide({
  onStartDeletionFeedback,
}: AccountDeletionGuideProps) {
  const copyEmail = () => {
    void Taro.setClipboardData({
      data: SUPPORT_EMAIL,
      success: () => {
        void Taro.showToast({ title: '邮箱已复制', icon: 'success' });
      },
    });
  };

  return (
    <View className="s-settings-help__deletion">
      <Text className="s-settings-help__deletion-title">申请删除账号与数据</Text>
      <Text className="s-settings-help__deletion-desc">
        你可随时申请删除账号及相关个人数据。我们将在核实身份后按隐私政策处理。
      </Text>

      <View className="s-settings__card s-settings-help__deletion-steps">
        <Text className="s-settings-help__deletion-step-title">
          申请方式（任选其一）
        </Text>
        <Text className="s-settings-help__deletion-step">
          1. 发送邮件至 {SUPPORT_EMAIL}
          ，说明「申请删除账号」并附上你的昵称或常用活动名。
        </Text>
        <Text className="s-settings-help__deletion-step">
          2. 点击下方按钮，在反馈中提交删除申请（我们将优先人工处理）。
        </Text>
        <View className="s-settings-help__deletion-actions">
          <Button className="s-settings-help__deletion-btn" onClick={copyEmail}>
            <Text className="s-btn-label">复制邮箱</Text>
          </Button>
          <Button
            className="s-settings-help__deletion-btn s-settings-help__deletion-btn--primary"
            onClick={onStartDeletionFeedback}
          >
            <Text className="s-btn-label">提交删除申请</Text>
          </Button>
        </View>
      </View>

      <View className="s-settings__card">
        <Text className="s-settings-help__deletion-step-title">
          将清除的数据范围（摘要）
        </Text>
        {DELETION_DATA_SCOPE.map((item) => (
          <Text key={item} className="s-settings-help__deletion-bullet">
            · {item}
          </Text>
        ))}
        <Text className="s-settings-help__deletion-footnote">
          完整说明见「法律与协议 → 隐私政策」中关于存储期限与你的权利。
        </Text>
      </View>
    </View>
  );
}
