import './LegalConsentRow.scss';
import React, { useCallback } from 'react';
import { Text, View } from '@tarojs/components';
import type { LegalDocId } from '../../legal';
import { goLegalDocument } from '../../utils/legalRoute';
import { useT } from '@/hooks/useI18n';

export type LegalConsentRowProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function openDoc(doc: LegalDocId, event?: { stopPropagation?: () => void }) {
  event?.stopPropagation?.();
  goLegalDocument(doc);
}

export function LegalConsentRow({ checked, onCheckedChange }: LegalConsentRowProps) {
  const t = useT();

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
        {t('legal.consentPrefix')}
        <Text
          className="s-legal-consent__link"
          onClick={(e) => openDoc('user-agreement', e)}
        >
          {t('legal.userAgreement')}
        </Text>
        {t('legal.consentAnd')}
        <Text
          className="s-legal-consent__link"
          onClick={(e) => openDoc('privacy-policy', e)}
        >
          {t('legal.privacyPolicy')}
        </Text>
        {t('legal.consentAlso')}
        <Text
          className="s-legal-consent__link"
          onClick={(e) => openDoc('community-guidelines', e)}
        >
          {t('legal.communityGuidelines')}
        </Text>
      </Text>
    </View>
  );
}
