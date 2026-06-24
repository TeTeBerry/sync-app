import type { FC } from 'react';
import { Share2 } from '@/components/icons';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import type { SetVoteLeaderboardEntry } from '@/types/activity';
import { Text, View } from '@tarojs/components';

export type LineupSetVoteShareTeaserProps = {
  activityName: string;
  voterPickNames: string[];
  topEntries: SetVoteLeaderboardEntry[];
  onStartVote: () => void;
};

export const LineupSetVoteShareTeaser: FC<LineupSetVoteShareTeaserProps> = ({
  activityName,
  voterPickNames,
  topEntries,
  onStartVote,
}) => {
  const t = useT();

  return (
    <View
      data-cmp="LineupSetVoteShareTeaser"
      className="s-activity-lineup__vote-teaser"
    >
      <Text className="s-activity-lineup__vote-teaser-kicker">
        {t('setVote.friendShare')}
      </Text>
      <Text className="s-activity-lineup__vote-teaser-title">
        {t('setVote.friendPicks', { activityName })}
      </Text>
      <View className="s-activity-lineup__vote-teaser-picks">
        {voterPickNames.map((name) => (
          <Text key={name} className="s-activity-lineup__vote-teaser-pick">
            {name}
          </Text>
        ))}
      </View>
      {topEntries.length > 0 ? (
        <View className="s-activity-lineup__vote-teaser-top">
          <Text className="s-activity-lineup__vote-teaser-top-label">
            {t('setVote.topTeaser')}
          </Text>
          {topEntries.map((entry) => (
            <Text
              key={entry.artistId}
              className="s-activity-lineup__vote-teaser-top-item"
            >
              {entry.artistName}
            </Text>
          ))}
        </View>
      ) : null}
      <Button
        className="s-activity-lineup__vote-teaser-cta"
        hoverClass="s-activity-lineup__vote-teaser-cta--pressed"
        onClick={onStartVote}
      >
        <Share2 size={16} color="#fff" />
        <Text>{t('setVote.voteToo')}</Text>
      </Button>
    </View>
  );
};
