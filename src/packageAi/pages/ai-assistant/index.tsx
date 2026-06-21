import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { ROUTES, switchTabTo } from '../../../utils/route';
import { consumeEventsSearchQuery } from '../../../utils/eventsSearchIntent';
import { setEventsSearchQuery } from '../../../utils/eventsSearchIntent';

/** Legacy AI assistant deep link — redirect to home or events search. */
export default function AiAssistantLegacyRedirect() {
  useEffect(() => {
    const query = consumeEventsSearchQuery();
    if (query) {
      setEventsSearchQuery(query);
      void Taro.switchTab({ url: ROUTES.EVENTS });
      return;
    }
    switchTabTo(ROUTES.HOME);
  }, []);

  return null;
}
