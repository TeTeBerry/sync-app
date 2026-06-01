import React from 'react';
import {
  PROFILE_DEBUG_ENTITLEMENT_LABELS,
  type ProfileDebugEntitlementPreset,
} from './profileDebugEntitlements';
import { Text, View } from '@tarojs/components';

export type ProfileDebugSectionProps = {
  preset: ProfileDebugEntitlementPreset;
  onSelectPreset: () => void;
  onPreviewContactUnlockExhausted: () => void;
  onPreviewAiMatchExhausted: () => void;
};

const ProfileDebugSection: React.FC<ProfileDebugSectionProps> = ({
  preset,
  onSelectPreset,
  onPreviewContactUnlockExhausted,
  onPreviewAiMatchExhausted,
}) => (
  <View className="s-profile__debug-block">
    <View
      className="s-profile__debug-entitlements"
      hoverClass="s-profile__debug-entitlements--pressed"
      onClick={onSelectPreset}
    >
      <Text className="s-profile__debug-entitlements-label">
        调试权益 ·{' '}
        {PROFILE_DEBUG_ENTITLEMENT_LABELS[preset] ??
          PROFILE_DEBUG_ENTITLEMENT_LABELS.api}
      </Text>
    </View>
    <View className="s-profile__debug-modals">
      <View
        className="s-profile__debug-modal-btn"
        hoverClass="s-profile__debug-modal-btn--pressed"
        onClick={onPreviewContactUnlockExhausted}
      >
        <Text className="s-profile__debug-modal-btn-label">
          预览 · 联系方式解锁用尽
        </Text>
      </View>
      <View
        className="s-profile__debug-modal-btn"
        hoverClass="s-profile__debug-modal-btn--pressed"
        onClick={onPreviewAiMatchExhausted}
      >
        <Text className="s-profile__debug-modal-btn-label">预览 · AI 匹配次数用尽</Text>
      </View>
    </View>
  </View>
);

export default ProfileDebugSection;
