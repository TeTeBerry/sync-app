import { CircleAlert, Shield, ShieldCheck, Upload } from 'lucide-react-taro';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';
import type { LiveInfoCertStatus } from '../../../../types/backend';

type EventLiveInfoCertCardProps = {
  userName: string;
  isCertified: boolean;
  certStatus: LiveInfoCertStatus;
  certExpiryLabel: string;
  rejectReason?: string;
  onUpload: () => void;
  onReupload: () => void;
};

export function EventLiveInfoCertCard({
  userName,
  isCertified,
  certStatus,
  certExpiryLabel,
  rejectReason,
  onUpload,
  onReupload,
}: EventLiveInfoCertCardProps) {
  if (isCertified) {
    return (
      <View className="s-live-info-cert s-live-info-cert--verified">
        <View className="s-live-info-cert__icon-wrap s-live-info-cert__icon-wrap--ok">
          <ShieldCheck size={22} color="#34c759" aria-hidden />
        </View>
        <View className="s-live-info-cert__body">
          <View className="s-live-info-cert__title-row">
            <Text className="s-live-info-cert__name">{userName}</Text>
            <Text className="s-live-info-cert__badge s-live-info-cert__badge--ok">
              ✓ 已认证 · 今日有效
            </Text>
          </View>
          <Text className="s-live-info-cert__hint">
            已提交手环认证，认证内容今日 {certExpiryLabel} 失效
          </Text>
        </View>
      </View>
    );
  }

  if (certStatus === 'rejected') {
    return (
      <View className="s-live-info-cert s-live-info-cert--rejected">
        <View className="s-live-info-cert__icon-wrap s-live-info-cert__icon-wrap--warn">
          <CircleAlert size={22} color="#ff9500" aria-hidden />
        </View>
        <View className="s-live-info-cert__body">
          <View className="s-live-info-cert__title-row">
            <Text className="s-live-info-cert__name">{userName}</Text>
            <Text className="s-live-info-cert__badge s-live-info-cert__badge--warn">
              未通过审核
            </Text>
          </View>
          <Text className="s-live-info-cert__hint">
            {rejectReason?.trim() ||
              '请拍摄手腕佩戴的活动入场腕带，确保腕带清晰可见后重新上传'}
          </Text>
        </View>
        <Button
          className="s-live-info-cert__upload"
          hoverClass="s-live-info-cert__upload--pressed"
          onClick={onReupload}
        >
          <Upload size={14} color="#fff" aria-hidden />
          <Text className="s-live-info-cert__upload-text">重新上传</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="s-live-info-cert">
      <View className="s-live-info-cert__icon-wrap">
        <Shield size={22} color="#8e8e93" aria-hidden />
      </View>
      <View className="s-live-info-cert__body">
        <View className="s-live-info-cert__title-row">
          <Text className="s-live-info-cert__name">{userName}</Text>
          <Text className="s-live-info-cert__badge">未认证</Text>
        </View>
        <Text className="s-live-info-cert__hint">
          上传手环照片参与现场实时资讯更新，认证后可发布
        </Text>
      </View>
      <Button
        className="s-live-info-cert__upload"
        hoverClass="s-live-info-cert__upload--pressed"
        onClick={onUpload}
      >
        <Upload size={14} color="#fff" aria-hidden />
        <Text className="s-live-info-cert__upload-text">上传手环</Text>
      </Button>
    </View>
  );
}
