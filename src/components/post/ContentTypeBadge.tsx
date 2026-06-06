import './ContentTypeBadge.scss';
import React from 'react';
import { Text, View } from '@tarojs/components';
import {
  CONTENT_TYPE_STYLE_KEYS,
  formatContentTypeHashtag,
  mergePostContentTypes,
  resolveContentTypeKey,
} from '../../utils/postContentTypeDisplay';

export {
  mergePostContentTypes,
  stripContentTypeHashtags,
  filterContentTypeTags,
} from '../../utils/postContentTypeDisplay';

const TYPE_STYLES: Record<string, string> = {
  team: 's-content-badge--team',
  accommodation: 's-content-badge--accommodation',
  carpool: 's-content-badge--carpool',
  ticket: 's-content-badge--ticket',
  groupbuy: 's-content-badge--groupbuy',
  share: 's-content-badge--share',
  other: 's-content-badge--other',
};

export const ContentTypeBadge: React.FC<{
  types?: string[];
  className?: string;
}> = ({ types, className }) => {
  const keys = mergePostContentTypes(types);
  if (!keys.length) return null;

  return (
    <View className={['s-content-badges', className].filter(Boolean).join(' ')}>
      {keys.map((key) => {
        const resolved = resolveContentTypeKey(key);
        const styleKey = CONTENT_TYPE_STYLE_KEYS.has(resolved) ? resolved : key;
        return (
          <View
            key={styleKey}
            className={`s-content-badge ${TYPE_STYLES[styleKey] ?? ''}`}
          >
            <Text className="s-content-badge__label">
              {formatContentTypeHashtag(styleKey)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
