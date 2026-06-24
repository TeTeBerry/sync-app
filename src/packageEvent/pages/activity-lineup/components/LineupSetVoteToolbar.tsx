import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Button, cn } from '@/components/ui';
import { useT } from '@/hooks/useI18n';

export type LineupSetVoteToolbarProps = {
  enabled: boolean;
  voteModeEnabled: boolean;
  selectedCount: number;
  maxSelection: number;
  onVoteModeChange: (enabled: boolean) => void;
};

export const LineupSetVoteToolbar: FC<LineupSetVoteToolbarProps> = ({
  enabled,
  voteModeEnabled,
  selectedCount,
  maxSelection,
  onVoteModeChange,
}) => {
  const t = useT();

  if (!enabled) {
    return null;
  }

  return (
    <View data-cmp="LineupSetVoteToolbar" className="s-activity-lineup__vote-toolbar">
      <View className="s-activity-lineup__vote-toolbar-main">
        <Text className="s-activity-lineup__vote-toolbar-label">
          {t('activityLineup.setVoteToggleLabel')}
        </Text>
        <Button
          className={cn(
            's-activity-lineup__vote-toggle',
            voteModeEnabled && 's-activity-lineup__vote-toggle--on',
          )}
          role="switch"
          aria-checked={voteModeEnabled}
          aria-label={t('activityLineup.setVoteToggleLabel')}
          hoverClass="s-activity-lineup__vote-toggle--pressed"
          onClick={() => onVoteModeChange(!voteModeEnabled)}
        >
          <View className="s-activity-lineup__vote-toggle-knob" aria-hidden />
        </Button>
      </View>
      {voteModeEnabled ? (
        <Text className="s-activity-lineup__vote-toolbar-hint">
          {t('activityLineup.setVoteModeHint', {
            count: selectedCount,
            max: maxSelection,
          })}
        </Text>
      ) : (
        <Text className="s-activity-lineup__vote-toolbar-hint s-activity-lineup__vote-toolbar-hint--muted">
          {t('activityLineup.browseModeHint')}
        </Text>
      )}
    </View>
  );
};
