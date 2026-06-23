import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import {
  formatLineupTimeRange,
  type LineupSessionGroup,
} from '../utils/groupLineupBySession';

type LineupScheduleDayProps = {
  session: LineupSessionGroup;
  onArtistPress?: (artistId: string) => void;
};

export const LineupScheduleDay: FC<LineupScheduleDayProps> = ({
  session,
  onArtistPress,
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
        {session.performances.map((performance) => (
          <View
            key={`${performance.dateKey}-${performance.artistId}-${performance.startTime}`}
            className="s-activity-lineup__slot"
          >
            <Text className="s-activity-lineup__slot-time">
              {formatLineupTimeRange(performance.startTime, performance.endTime)}
            </Text>
            <View className="s-activity-lineup__slot-body">
              <Text
                className={[
                  's-activity-lineup__slot-artist',
                  onArtistPress ? 's-activity-lineup__slot-artist--interactive' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={
                  onArtistPress ? () => onArtistPress(performance.artistId) : undefined
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
        ))}
      </View>
    </View>
  );
};
