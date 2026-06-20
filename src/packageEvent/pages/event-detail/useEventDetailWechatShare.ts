import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { useEffect, useRef } from 'react';
import type { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import {
  buildEventDetailShareAppMessage,
  buildEventDetailShareFallback,
  buildEventDetailShareTimeline,
  type EventDetailShareActivity,
} from '@/domains/activity-share/utils/eventDetailWechatShare.util';

type ActivityQuery = ReturnType<typeof useActivityDetailQuery>;

export function useEventDetailWechatShare(options: {
  eventId: number;
  activityQuery: ActivityQuery;
}) {
  const shareRef = useRef<EventDetailShareActivity | null>(null);
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

  useEffect(() => {
    const data = options.activityQuery.data;
    if (data?.legacyId != null && data.name?.trim()) {
      shareRef.current = {
        legacyId: data.legacyId,
        name: data.name,
        date: data.date,
        location: data.location,
        image: data.image,
      };
      return;
    }
    if (options.eventId > 0) {
      shareRef.current = {
        legacyId: options.eventId,
        name: '活动详情',
      };
      return;
    }
    shareRef.current = null;
  }, [options.activityQuery.data, options.eventId]);

  useDidShow(() => {
    if (!isWeapp) return;
    void Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    }).catch(() => undefined);
  });

  useShareAppMessage(() => {
    const current = shareRef.current;
    if (!current?.name || current.name === '活动详情') {
      return buildEventDetailShareFallback(options.eventId);
    }
    return buildEventDetailShareAppMessage(current);
  });

  useShareTimeline(() => {
    const current = shareRef.current;
    if (!current?.name || current.name === '活动详情') {
      return { title: '活动详情' };
    }
    return buildEventDetailShareTimeline(current);
  });

  return { isWeapp };
}
