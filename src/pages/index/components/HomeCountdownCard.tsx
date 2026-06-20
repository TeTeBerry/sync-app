import type { FC } from 'react';
import { useCountdown } from '../../../hooks/useCountdown';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type HomeCountdownCardProps = {
  eventName?: string;
  targetAt?: Date | null;
};

export const HomeCountdownCard: FC<HomeCountdownCardProps> = ({
  eventName,
  targetAt,
}) => {
  const hasTarget = targetAt != null && eventName != null && eventName.length > 0;
  const parts = useCountdown(hasTarget ? targetAt : null);
  const t = useT();
  const ariaLabel = hasTarget
    ? `${eventName} countdown`
    : 'Upcoming activity countdown';

  return (
    <View className="s-home-countdown" aria-label={ariaLabel}>
      <View className="s-home-countdown__timer">
        {parts.map((part, index) => (
          <View key={part.unit} className="s-home-countdown__segment">
            <View className="s-home-countdown__part">
              <View className="s-home-countdown__num-wrap">
                <Text
                  className={
                    part.accent
                      ? 's-home-countdown__num s-home-countdown__num--accent'
                      : 's-home-countdown__num'
                  }
                >
                  {part.value}
                </Text>
                <Text className="s-home-countdown__unit">{t(part.unit)}</Text>
              </View>
            </View>
            {index < parts.length - 1 ? (
              <Text className="s-home-countdown__sep">·</Text>
            ) : null}
          </View>
        ))}
      </View>
      <Text className="s-home-countdown__copy">
        {hasTarget ? (
          <>{t('countdown.untilStart', { eventName })}</>
        ) : (
          t('countdown.noUpcoming')
        )}
      </Text>
    </View>
  );
};
