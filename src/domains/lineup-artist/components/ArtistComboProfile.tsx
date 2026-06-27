import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Image, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import type { CatalogLineupArtistMemberDetail } from '../../../types/backend';
import { thumbnailImageUrl } from '../../../utils/imageUrl';

type ArtistComboMemberCardProps = {
  member: CatalogLineupArtistMemberDetail;
};

export const ArtistComboMemberCard: FC<ArtistComboMemberCardProps> = ({ member }) => {
  const t = useT();
  const [bioExpanded, setBioExpanded] = useState(false);
  const thumbSrc = member.thumbnail
    ? thumbnailImageUrl(member.thumbnail, IMAGE_SIZE.avatarMd, 1)
    : undefined;
  const profileSummary = member.profileSummary?.trim();
  const profileFull = member.profileFull?.trim();
  const hasExpandableBio = Boolean(
    profileFull && profileSummary && profileFull.length > profileSummary.length,
  );
  const bioText = bioExpanded
    ? profileFull || profileSummary || t('events.artistProfile.bioPlaceholder')
    : profileSummary || profileFull || t('events.artistProfile.bioPlaceholder');
  const genreLabel =
    member.genreLabel && member.genreLabel !== '风格待补充'
      ? member.genreLabel
      : member.genre && member.genre !== '风格待补充'
        ? member.genre
        : '';
  const chineseAliases = member.chineseAliases ?? [];
  const representativeTracks = member.representativeTracks ?? [];

  return (
    <View className="s-artist-profile-sheet__member-card">
      <View className="s-artist-profile-sheet__member-head">
        <View className="s-artist-profile-sheet__member-avatar-wrap">
          <ImageWithFallback
            src={thumbSrc}
            alt={member.name}
            wrapperClassName="s-artist-profile-sheet__member-avatar"
            imageClassName="s-artist-profile-sheet__member-avatar-img"
            fallbackWrapperClassName="s-artist-profile-sheet__member-avatar s-artist-profile-sheet__member-avatar--fallback"
            fallback={member.name.slice(0, 2)}
          />
        </View>
        <View className="s-artist-profile-sheet__member-identity">
          <Text className="s-artist-profile-sheet__member-name">{member.name}</Text>
          {genreLabel ? (
            <Text className="s-artist-profile-sheet__member-genre s-line-clamp-2">
              {genreLabel}
            </Text>
          ) : null}
          {chineseAliases.length ? (
            <Text className="s-artist-profile-sheet__member-aliases s-line-clamp-1">
              {t('events.artistProfile.aliasesLabel')}：{chineseAliases.join('、')}
            </Text>
          ) : null}
        </View>
      </View>
      <Text
        className={[
          's-artist-profile-sheet__member-bio',
          !bioExpanded && hasExpandableBio ? 's-line-clamp-3' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {bioText}
      </Text>
      {hasExpandableBio ? (
        <Text
          className="s-artist-profile-sheet__bio-toggle"
          onClick={() => setBioExpanded((value) => !value)}
        >
          {bioExpanded
            ? t('events.artistProfile.bioCollapse')
            : t('events.artistProfile.bioExpand')}
        </Text>
      ) : null}
      {representativeTracks.length ? (
        <View className="s-artist-profile-sheet__member-tracks">
          {representativeTracks.map((track) => (
            <Text
              key={track}
              className="s-artist-profile-sheet__member-track-item s-line-clamp-1"
            >
              {track}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};

type ArtistComboProfileHeroProps = {
  comboName: string;
  activityCount?: number;
  members: CatalogLineupArtistMemberDetail[];
  genreLabel: string;
};

export const ArtistComboProfileHero: FC<ArtistComboProfileHeroProps> = ({
  comboName,
  activityCount,
  members,
  genreLabel,
}) => {
  const t = useT();
  const memberThumbs = useMemo(
    () =>
      members.map((member) =>
        member.thumbnail
          ? thumbnailImageUrl(member.thumbnail, IMAGE_SIZE.avatarMd, 1)
          : undefined,
      ),
    [members],
  );
  const heroBackdropSrc = memberThumbs.find(Boolean);

  return (
    <View className="s-artist-profile-sheet__hero s-artist-profile-sheet__hero--combo">
      {heroBackdropSrc ? (
        <View className="s-artist-profile-sheet__hero-backdrop" aria-hidden>
          <Image
            src={heroBackdropSrc}
            className="s-artist-profile-sheet__hero-backdrop-img"
            mode="aspectFill"
          />
          <View className="s-artist-profile-sheet__hero-backdrop-scrim" />
        </View>
      ) : null}
      <View className="s-artist-profile-sheet__hero-glow" aria-hidden />
      <View className="s-artist-profile-sheet__combo-header">
        <View className="s-artist-profile-sheet__combo-avatars">
          {members.map((member, index) => (
            <View
              key={member.name}
              className="s-artist-profile-sheet__combo-avatar-group"
            >
              {index > 0 ? (
                <Text className="s-artist-profile-sheet__combo-connector">
                  {t('events.artistProfile.comboConnector')}
                </Text>
              ) : null}
              <View className="s-artist-profile-sheet__combo-avatar-stage">
                <ImageWithFallback
                  src={memberThumbs[index]}
                  alt={member.name}
                  wrapperClassName="s-artist-profile-sheet__combo-avatar"
                  imageClassName="s-artist-profile-sheet__combo-avatar-img"
                  fallbackWrapperClassName="s-artist-profile-sheet__combo-avatar s-artist-profile-sheet__combo-avatar--fallback"
                  fallback={member.name.slice(0, 2)}
                />
                <Text className="s-artist-profile-sheet__combo-avatar-name s-line-clamp-1">
                  {member.name}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View className="s-artist-profile-sheet__combo-title-row">
          <Text className="s-artist-profile-sheet__combo-title">{comboName}</Text>
          {activityCount != null ? (
            <Text className="s-artist-profile-sheet__count-pill">
              {t('events.artistActivityCount', { count: activityCount })}
            </Text>
          ) : null}
        </View>
        {genreLabel ? (
          <Text className="s-artist-profile-sheet__genre">{genreLabel}</Text>
        ) : null}
        <Text className="s-artist-profile-sheet__combo-hint">
          {t('events.artistProfile.comboHint')}
        </Text>
      </View>
    </View>
  );
};
