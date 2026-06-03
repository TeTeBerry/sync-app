import './TempChatRetentionBanner.scss';
import { Info } from '../icons';
import type { TempChatSession } from '../../types/tempChat';
import {
  formatTempChatRetentionNotice,
  TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT,
} from '../../utils/tempChatRetention';
import { Text, View } from '@tarojs/components';

export type TempChatRetentionBannerProps = {
  session?: Pick<TempChatSession, 'destroysAt' | 'postTitle'>;
};

export function TempChatRetentionBanner({ session }: TempChatRetentionBannerProps) {
  const text = session
    ? formatTempChatRetentionNotice(session)
    : `临时会话将在对应电音节结束 ${TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT} 天后自动销毁，请及时沟通。`;

  return (
    <View className="s-temp-chat-retention" role="note">
      <View className="s-temp-chat-retention__icon" aria-hidden>
        <Info size={16} color="#ff9f0a" />
      </View>
      <Text className="s-temp-chat-retention__text">{text}</Text>
    </View>
  );
}
