import { Image, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { usePlurPeaceCoverSrc } from '@/hooks/usePlurPeaceCoverSrc';
import './PlurCultureHero.scss';

export function PlurCultureHero() {
  const t = useT();
  const peaceCoverSrc = usePlurPeaceCoverSrc();

  return (
    <View className="s-plur-culture-hero" data-cmp="PlurCultureHero">
      <View className="s-plur-culture-hero__backdrop" aria-hidden>
        <Image
          className="s-plur-culture-hero__backdrop-image"
          src={peaceCoverSrc}
          mode="aspectFill"
        />
        <View className="s-plur-culture-hero__backdrop-scrim" />
      </View>

      <View className="s-plur-culture-hero__ui">
        <Text className="s-plur-culture-hero__title">{t('plur.entry.title')}</Text>
        <Text className="s-plur-culture-hero__tagline">{t('plur.entry.tagline')}</Text>
      </View>
    </View>
  );
}
