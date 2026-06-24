import './ThemedLoadingModal.scss';
import { Text, View } from '@tarojs/components';
import { useOverlayLock } from '../hooks/useOverlayLock';
import { useT } from '@/hooks/useI18n';
import {
  selectLoadingActive,
  selectLoadingTitle,
  useLoadingStore,
} from '../stores/loadingStore';

function PinkSpinner() {
  return (
    <View className="s-themed-loading-modal__spinner-wrap" aria-hidden>
      <View className="s-themed-loading-modal__spinner" />
    </View>
  );
}

/** Global themed loading card — pink spinner on dark glass panel. */
export default function ThemedLoadingModal() {
  const active = useLoadingStore(selectLoadingActive);
  const title = useLoadingStore(selectLoadingTitle);
  const t = useT();
  const displayLabel = title ?? t('common.loading');

  useOverlayLock(active);

  if (!active) {
    return null;
  }

  return (
    <View
      className="s-overlay s-themed-loading-modal"
      style={{ zIndex: 'var(--overlay-z-loading)' }}
      role="presentation"
      catchMove
    >
      <View className="s-overlay__backdrop s-themed-loading-modal__backdrop" />
      <View
        className="s-overlay__panel s-themed-loading-modal__panel"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={displayLabel}
      >
        <PinkSpinner />
        <Text className="s-themed-loading-modal__label">{displayLabel}</Text>
      </View>
    </View>
  );
}
