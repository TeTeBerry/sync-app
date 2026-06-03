import './AccountRiskBanner.scss';
import type { FC } from 'react';
import { ShieldAlert } from '../icons';
import { Button } from '../ui';
import type { AccountRiskPublicStatus } from '../../types/backend';
import {
  accountRiskReasonLabel,
  accountRiskStatusTitle,
  formatAccountRiskUntil,
} from '../../utils/accountRiskDisplay';
import {
  getAccountRiskBlockMessage,
  isAccountPublishRestricted,
} from '../../utils/accountRisk';
import { ROUTES, go } from '../../utils/route';
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

  const untilLabel = formatAccountRiskUntil(accountRisk?.postBlockedUntil);
  const reasonLabel = accountRiskReasonLabel(accountRisk?.reasonCode);

  const openAppeal = () => {
    go(`${ROUTES.SETTINGS}?section=appeal`);
  };

  return (
    <View
      className={`s-account-risk-banner${className ? ` ${className}` : ''}`}
      role="alert"
    >
      <View className="s-account-risk-banner__icon" aria-hidden>
        <ShieldAlert size={18} color="#ff6b6b" />
      </View>
      <View className="s-account-risk-banner__body">
        <Text className="s-account-risk-banner__title">
          {accountRiskStatusTitle(accountRisk)}
        </Text>
        <Text className="s-account-risk-banner__meta">
          原因：{reasonLabel}
          {untilLabel ? ` · 预计解禁：${untilLabel}` : ''}
        </Text>
        <Text className="s-account-risk-banner__message">
          {getAccountRiskBlockMessage(accountRisk)}
        </Text>
        {accountRisk?.appealHint ? (
          <Text className="s-account-risk-banner__hint">{accountRisk.appealHint}</Text>
        ) : null}
        <Button
          className="s-account-risk-banner__appeal-btn"
          hoverClass="s-account-risk-banner__appeal-btn--pressed"
          onClick={openAppeal}
        >
          <Text className="s-account-risk-banner__appeal-btn-text">申诉说明</Text>
        </Button>
      </View>
    </View>
  );
};
