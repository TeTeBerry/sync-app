import './AccountRiskBanner.scss';
import type { FC } from 'react';
import { ShieldAlert } from '../icons';
import type { AccountRiskPublicStatus } from '../../types/backend';
import {
  getAccountRiskBlockMessage,
  isAccountPublishRestricted,
} from '../../utils/accountRisk';
import { Text, View } from '@tarojs/components';

export type AccountRiskBannerProps = {
  accountRisk?: AccountRiskPublicStatus | null;
  className?: string;
};

export const AccountRiskBanner: FC<AccountRiskBannerProps> = ({
  accountRisk,
  className,
}) => {
  if (!isAccountPublishRestricted(accountRisk)) return null;

  const statusLabel =
    accountRisk?.status === 'banned' ? '账号已限制' : '发帖功能已暂停';

  return (
    <View
      className={`s-account-risk-banner${className ? ` ${className}` : ''}`}
      role="alert"
    >
      <View className="s-account-risk-banner__icon" aria-hidden>
        <ShieldAlert size={18} color="#ff6b6b" />
      </View>
      <View className="s-account-risk-banner__body">
        <Text className="s-account-risk-banner__title">{statusLabel}</Text>
        <Text className="s-account-risk-banner__message">
          {getAccountRiskBlockMessage(accountRisk)}
        </Text>
      </View>
    </View>
  );
};
