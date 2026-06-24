import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';

export type LineupSetVoteSubmitBarProps = {
  visible: boolean;
  submitting: boolean;
  syncGenres: boolean;
  onSyncGenresChange: (value: boolean) => void;
  onSubmit: () => void;
};

export const LineupSetVoteSubmitBar: FC<LineupSetVoteSubmitBarProps> = ({
  visible,
  submitting,
  syncGenres,
  onSyncGenresChange,
  onSubmit,
}) => {
  const t = useT();

  if (!visible) {
    return null;
  }

  return (
    <View
      data-cmp="LineupSetVoteSubmitBar"
      className="s-activity-lineup__vote-submit-bar"
    >
      <View
        className="s-activity-lineup__vote-sync-row"
        onClick={() => onSyncGenresChange(!syncGenres)}
        role="checkbox"
        aria-checked={syncGenres}
      >
        <View
          className={[
            's-activity-lineup__vote-sync-check',
            syncGenres ? 's-activity-lineup__vote-sync-check--on' : '',
          ].join(' ')}
        />
        <Text className="s-activity-lineup__vote-sync-label">
          {t('setVote.syncGenres')}
        </Text>
      </View>
      <Button
        className="s-activity-lineup__vote-submit-btn"
        hoverClass="s-activity-lineup__vote-submit-btn--pressed"
        onClick={onSubmit}
        disabled={submitting}
      >
        <Text className="s-activity-lineup__vote-submit-btn-text">
          {submitting ? t('setVote.submitting') : t('setVote.submit')}
        </Text>
      </Button>
    </View>
  );
};
