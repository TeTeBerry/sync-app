import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import {
  formatLineupTimeRange,
  type LineupSessionGroup,
} from '../utils/groupLineupBySession';

type LineupScheduleDayProps = {
  session: LineupSessionGroup;
  onArtistPress?: (artistId: string) => void;
  voteMode?: boolean;
  selectedArtistIds?: string[];
};

export const LineupScheduleDay: FC<LineupScheduleDayProps> = ({
  session,
  onArtistPress,
  voteMode = false,
  selectedArtistIds = [],
}) => {
  return (
    <View className="s-activity-lineup__day">
      <View className="s-activity-lineup__day-head">
        <View className="s-activity-lineup__day-accent" aria-hidden />
        <Text className="s-activity-lineup__day-label">
          {session.bannerDateLabel || session.label}
        </Text>
      </View>

      <View className="s-activity-lineup__slots">
        {session.performances.map((performance) => {
          const isSelected =
            voteMode && selectedArtistIds.includes(performance.artistId);

          return (
            <View
              key={`${performance.dateKey}-${performance.artistId}-${performance.startTime}`}
              className={[
                's-activity-lineup__slot',
                isSelected ? 's-activity-lineup__slot--vote-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Text className="s-activity-lineup__slot-time">
                {formatLineupTimeRange(performance.startTime, performance.endTime)}
              </Text>
              <View className="s-activity-lineup__slot-body">
                <Text
                  className={[
                    's-activity-lineup__slot-artist',
                    onArtistPress ? 's-activity-lineup__slot-artist--interactive' : '',
                    isSelected ? 's-activity-lineup__slot-artist--vote-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={
                    onArtistPress
                      ? () => onArtistPress(performance.artistId)
                      : undefined
                  }
                >
                  {performance.artistName}
                </Text>
                {performance.stageLabel ? (
                  <Text className="s-activity-lineup__slot-meta">
                    {performance.stageLabel}
                    {performance.genreLabel ? ` · ${performance.genreLabel}` : ''}
                  </Text>
                ) : performance.genreLabel ? (
                  <Text className="s-activity-lineup__slot-meta">
                    {performance.genreLabel}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
