import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { goLegalDocument } from '@/utils/legalRoute';
import { goPlurFilmFromEntry, isPlurFilmH5Available } from '@/utils/plurRoute';
import { Text, View } from '@tarojs/components';

export function PlurCultureFooter() {
  const t = useT();
  const showWatchFilm = isPlurFilmH5Available();

  return (
    <View className="s-legal-doc__actions" data-cmp="PlurCultureFooter">
      <Button
        className="s-legal-doc__action s-legal-doc__action--primary"
        hoverClass="s-legal-doc__action--pressed"
        onClick={() => goLegalDocument('community-guidelines')}
      >
        <Text className="s-legal-doc__action-label">
          {t('plur.culturePage.readGuidelines')}
        </Text>
      </Button>
      {showWatchFilm ? (
        <Button
          className="s-legal-doc__action s-legal-doc__action--secondary"
          hoverClass="s-legal-doc__action--pressed"
          onClick={() => goPlurFilmFromEntry({ from: 'about' })}
        >
          <Text className="s-legal-doc__action-label">
            {t('plur.culturePage.watchFilm')}
          </Text>
        </Button>
      ) : null}
    </View>
  );
}
