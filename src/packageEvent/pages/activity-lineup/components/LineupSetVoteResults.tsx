import type { FC } from 'react';
import { RefreshCw, Share2 } from '@/components/icons';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import type { SetVoteLeaderboardEntry, SetVotePick } from '@/types/activity';
import { Text, View } from '@tarojs/components';

/** Lucide icons render as data URLs in weapp — CSS variables are not resolved. */
const VOTE_ACTION_ICON_COLOR = '#ff0066';
const VOTE_ACTION_ICON_MUTED = '#8e8e93';

export type LineupSetVoteResultsProps = {
  picks: SetVotePick[];
  entries: SetVoteLeaderboardEntry[];
  totalVoters: number;
  revoteAllowedToday?: boolean;
  isWeapp?: boolean;
  onEditPicks: () => void;
  onSharePoster: () => void;
};

export const LineupSetVoteResults: FC<LineupSetVoteResultsProps> = ({
  picks,
  entries,
  totalVoters,
  revoteAllowedToday,
  isWeapp = false,
  onEditPicks,
  onSharePoster,
}) => {
  const t = useT();
  const topEntries = entries.slice(0, 5);

  return (
    <View data-cmp="LineupSetVoteResults" className="s-activity-lineup__vote-results">
      <View className="s-activity-lineup__vote-results-head">
        <Text className="s-activity-lineup__vote-results-title">
          {t('setVote.myWishlist')}
        </Text>
        <Text className="s-activity-lineup__vote-results-meta">
          {t('setVote.totalVoters', { count: totalVoters })}
        </Text>
      </View>

      <View className="s-activity-lineup__vote-results-picks">
        {picks.map((pick) => (
          <Text key={pick.artistId} className="s-activity-lineup__vote-results-pick">
            {pick.artistName}
          </Text>
        ))}
      </View>

      {topEntries.length > 0 ? (
        <>
          <Text className="s-activity-lineup__vote-results-leaderboard-title">
            {t('setVote.leaderboardTitle')}
          </Text>
          <View className="s-activity-lineup__vote-results-leaderboard">
            {topEntries.map((entry, index) => (
              <View
                key={entry.artistId}
                className="s-activity-lineup__vote-results-row"
              >
                <Text className="s-activity-lineup__vote-results-rank">
                  {index + 1}
                </Text>
                <View className="s-activity-lineup__vote-results-row-main">
                  <Text className="s-activity-lineup__vote-results-name">
                    {entry.artistName}
                  </Text>
                  <Text className="s-activity-lineup__vote-results-stats">
                    {t('setVote.voteStats', {
                      count: entry.voteCount,
                      percent: entry.votePercent,
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View className="s-activity-lineup__vote-results-actions">
        {isWeapp ? (
          <Button className="s-activity-lineup__vote-results-btn" openType="share">
            <Share2 size={14} color={VOTE_ACTION_ICON_COLOR} />
            <Text>{t('setVote.shareCard')}</Text>
          </Button>
        ) : null}
        <Button
          className="s-activity-lineup__vote-results-btn"
          hoverClass="s-activity-lineup__vote-results-btn--pressed"
          onClick={onSharePoster}
        >
          <Share2 size={14} color={VOTE_ACTION_ICON_COLOR} />
          <Text>{t('setVote.sharePoster')}</Text>
        </Button>
        <Button
          className="s-activity-lineup__vote-results-btn"
          hoverClass="s-activity-lineup__vote-results-btn--pressed"
          onClick={onEditPicks}
          disabled={revoteAllowedToday === false}
        >
          <RefreshCw
            size={14}
            color={
              revoteAllowedToday === false
                ? VOTE_ACTION_ICON_MUTED
                : VOTE_ACTION_ICON_COLOR
            }
          />
          <Text>{t('setVote.editPicks')}</Text>
        </Button>
      </View>
    </View>
  );
};
