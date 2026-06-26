import './PlurEntrySheet.scss';
import { Image, Text, View } from '@tarojs/components';
import { Button } from '@/components/ui';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { useT } from '@/hooks/useI18n';
import { usePlurPeaceCoverSrc } from '@/hooks/usePlurPeaceCoverSrc';

export type PlurEntrySheetProps = {
  open: boolean;
  onSkip: () => void;
  onWatchFilm: () => void;
  onLearnMore: () => void;
};

export function PlurEntrySheet({
  open,
  onSkip,
  onWatchFilm,
  onLearnMore,
}: PlurEntrySheetProps) {
  const t = useT();
  const peaceCoverSrc = usePlurPeaceCoverSrc();
  useOverlayLock(open);

  if (!open) {
    return null;
  }

  return (
    <View className="s-plur-entry" data-cmp="PlurEntrySheet" role="presentation">
      {/* Full-screen void: night sky → navy bleed (matches image top feather) */}
      <View className="s-plur-entry__atmosphere" aria-hidden />

      <View className="s-plur-entry__backdrop" aria-hidden>
        <Image
          className="s-plur-entry__backdrop-image"
          src={peaceCoverSrc}
          mode="widthFix"
        />
        <View className="s-plur-entry__backdrop-feather" />
        <View className="s-plur-entry__backdrop-scrim" />
      </View>

      <View
        className="s-plur-entry__ui"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plur-entry-title"
      >
        <View className="s-plur-entry__hero">
          <Text id="plur-entry-title" className="s-plur-entry__title">
            {t('plur.entry.title')}
          </Text>
          <Text className="s-plur-entry__tagline">{t('plur.entry.tagline')}</Text>
        </View>

        <View className="s-plur-entry__actions">
          <Button
            className="s-plur-entry__cta s-plur-entry__cta--primary"
            hoverClass="s-plur-entry__cta--pressed"
            onClick={onWatchFilm}
          >
            {t('plur.entry.watchFilm')}
          </Button>
          <Button
            className="s-plur-entry__cta s-plur-entry__cta--secondary"
            hoverClass="s-plur-entry__cta--pressed"
            onClick={onSkip}
          >
            {t('plur.entry.skip')}
          </Button>
          <View
            className="s-plur-entry__learn-more"
            hoverClass="s-plur-entry__learn-more--pressed"
            onClick={onLearnMore}
            role="button"
          >
            <Text className="s-plur-entry__learn-more-label">
              {t('plur.entry.learnMore')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
