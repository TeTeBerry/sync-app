import { ChevronDown, ChevronUp, Info } from '../../../../components/icons';
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
    <View
      className={['s-onsite-info', expanded ? 's-onsite-info--expanded' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <View
        className="s-onsite-info__header"
        onClick={toggle}
        role="button"
        aria-expanded={expanded}
        aria-label={`${ONSITE_VERIFICATION_TITLE}，点击${expanded ? '收起' : '展开'}`}
      >
        <View className="s-onsite-info__icon-wrap" aria-hidden>
          <Info size={18} color="#8e8e93" />
        </View>
        <View className="s-onsite-info__head-copy">
          <Text className="s-onsite-info__title">{ONSITE_VERIFICATION_TITLE}</Text>
          <Text className="s-onsite-info__summary">
            手环认证、发帖标识与现场资讯规则
          </Text>
        </View>
        <View className="s-onsite-info__action" aria-hidden>
          <Text className="s-onsite-info__action-text">
            {expanded ? '收起' : '展开'}
          </Text>
          {expanded ? (
            <ChevronUp size={16} color="#8e8e93" />
          ) : (
            <ChevronDown size={16} color="#8e8e93" />
          )}
        </View>
      </View>
      {expanded ? (
        <View className="s-onsite-info__body">
          {ONSITE_VERIFICATION_POINTS.map((line) => (
            <View key={line} className="s-onsite-info__point">
              <View className="s-onsite-info__bullet" />
              <Text className="s-onsite-info__line">{line}</Text>
            </View>
          ))}
          <Text className="s-onsite-info__footer">{ONSITE_VERIFICATION_FOOTER}</Text>
        </View>
      ) : null}
    </View>
  );
}
