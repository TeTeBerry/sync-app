import React, { useMemo } from 'react';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { resolveAboutPageVersionLabel } from '@/utils/aboutPageVersion.util';
import {
  goPlurCulture,
  goPlurFilmFromEntry,
  isPlurFilmH5Available,
} from '@/utils/plurRoute';
import { Text, View } from '@tarojs/components';

export function AboutSettings() {
  const t = useT();
  const showWatchFilm = isPlurFilmH5Available();
  const versionLabel = useMemo(() => resolveAboutPageVersionLabel(t), [t]);

  return (
    <View className="s-settings__about" data-cmp="AboutSettings">
      <View className="s-settings__card s-settings__about-card">
        <View className="s-settings__about-copy">
          <Text className="s-settings__about-heading">
            {t('plur.about.spiritHeading')}
          </Text>
          <Text className="s-settings__about-desc">{t('plur.about.spiritDesc')}</Text>
        </View>
        <View className="s-settings__about-actions">
          {showWatchFilm ? (
            <Button
              className="s-settings__about-action s-settings__about-action--primary"
              hoverClass="s-settings__about-action--pressed"
              onClick={() => goPlurFilmFromEntry({ from: 'about' })}
            >
              <Text className="s-settings__about-action-label">
                {t('plur.about.watchFilm')}
              </Text>
            </Button>
          ) : null}
          <Button
            className={`s-settings__about-action${showWatchFilm ? ' s-settings__about-action--secondary' : ' s-settings__about-action--primary'}`}
            hoverClass="s-settings__about-action--pressed"
            onClick={() => goPlurCulture()}
          >
            <Text className="s-settings__about-action-label">
              {t('plur.about.readCulture')}
            </Text>
          </Button>
        </View>
      </View>
      <Text className="s-settings__about-version">{versionLabel}</Text>
    </View>
  );
}
