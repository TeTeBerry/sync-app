import './LegalConsentRow.scss';
import React, { useCallback } from 'react';
import { Text, View } from '@tarojs/components';
import type { LegalDocId } from '../../legal';
import { goLegalDocument } from '../../utils/legalRoute';

export type LegalConsentRowProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function openDoc(doc: LegalDocId, event?: { stopPropagation?: () => void }) {
  event?.stopPropagation?.();
  goLegalDocument(doc);
}

export function LegalConsentRow({ checked, onCheckedChange }: LegalConsentRowProps) {
  const toggle = useCallback(() => {
    onCheckedChange(!checked);
  }, [checked, onCheckedChange]);

  return (
    <View className="s-legal-consent" onTap={toggle}>
      <View
        className={`s-legal-consent__check${checked ? ' s-legal-consent__check--on' : ''}`}
      >
        {checked ? <Text className="s-legal-consent__check-mark">✓</Text> : null}
      </View>
      <Text className="s-legal-consent__text">
        我已阅读并同意
        <Text
          className="s-legal-consent__link"
          onClick={(e) => openDoc('user-agreement', e)}
        >
          《用户服务协议》
        </Text>
        和
        <Text
          className="s-legal-consent__link"
          onClick={(e) => openDoc('privacy-policy', e)}
        >
          《隐私政策》
        </Text>
        及
        <Text
          className="s-legal-consent__link"
          onClick={(e) => openDoc('community-guidelines', e)}
        >
          《社区规范》
        </Text>
      </Text>
    </View>
  );
}
