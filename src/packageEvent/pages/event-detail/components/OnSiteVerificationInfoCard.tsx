import { Info } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import {
  ONSITE_VERIFICATION_FOOTER,
  ONSITE_VERIFICATION_POINTS,
  ONSITE_VERIFICATION_TITLE,
} from '../../../../constants/onsiteVerificationCopy';
import { Text, View } from '@tarojs/components';
import { useCallback, useState } from 'react';

export function OnSiteVerificationInfoCard() {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  return (
    <View className="s-onsite-info">
      <Button
        className="s-onsite-info__toggle"
        hoverClass="s-onsite-info__toggle--pressed"
        onClick={toggle}
      >
        <Info size={16} color="#8e8e93" aria-hidden />
        <Text className="s-onsite-info__toggle-text">{ONSITE_VERIFICATION_TITLE}</Text>
        <Text className="s-onsite-info__chevron">{expanded ? '收起' : '展开'}</Text>
      </Button>
      {expanded ? (
        <View className="s-onsite-info__body">
          {ONSITE_VERIFICATION_POINTS.map((line) => (
            <Text key={line} className="s-onsite-info__line">
              · {line}
            </Text>
          ))}
          <Text className="s-onsite-info__footer">{ONSITE_VERIFICATION_FOOTER}</Text>
        </View>
      ) : null}
    </View>
  );
}
