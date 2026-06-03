import './VenueMapNameSheet.scss';
import { MapPin, X } from '../icons';
import { Button } from '../ui';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import { Input, Text, View } from '@tarojs/components';

const LABEL_MAX = 24;

export type VenueMapNameSheetProps = {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function VenueMapNameSheet({
  open,
  value,
  onChange,
  onConfirm,
  onCancel,
}: VenueMapNameSheetProps) {
  useOverlayLock(open);
  if (!open) return null;

  const canConfirm = value.trim().length > 0;

  return (
    <View
      className="s-overlay s-overlay--sheet s-venue-map-name-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onCancel} />
      <View
        className="s-overlay__panel s-venue-map-name-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-map-name-sheet-title"
      >
        <View className="s-venue-map-name-sheet__handle" aria-hidden />
        <View className="s-venue-map-name-sheet__header">
          <View className="s-venue-map-name-sheet__title-row">
            <View className="s-venue-map-name-sheet__title-icon" aria-hidden>
              <MapPin size={18} color="#ff2d6a" />
            </View>
            <Text
              id="venue-map-name-sheet-title"
              className="s-venue-map-name-sheet__title"
            >
              为集合点命名
            </Text>
          </View>
          <Button
            className="s-venue-map-name-sheet__close"
            aria-label="关闭"
            hoverClass="s-venue-map-name-sheet__close--pressed"
            onTap={onCancel}
          >
            <X size={20} />
          </Button>
        </View>

        <Text className="s-venue-map-name-sheet__hint">
          例如：旗杆下、A 区入口、主舞台左侧
        </Text>

        <Input
          className="s-venue-map-name-sheet__input"
          value={value}
          maxlength={LABEL_MAX}
          placeholder="输入标记名称"
          focus
          confirmType="done"
          onInput={(e) => onChange(e.detail.value)}
          onConfirm={canConfirm ? onConfirm : undefined}
        />

        <View className="s-venue-map-name-sheet__actions">
          <Button
            className="s-venue-map-name-sheet__btn s-venue-map-name-sheet__btn--ghost"
            hoverClass="s-venue-map-name-sheet__btn--pressed"
            onTap={onCancel}
          >
            取消
          </Button>
          <Button
            className={[
              's-venue-map-name-sheet__btn',
              's-venue-map-name-sheet__btn--primary',
              canConfirm ? '' : 's-venue-map-name-sheet__btn--disabled',
            ]
              .filter(Boolean)
              .join(' ')}
            hoverClass="s-venue-map-name-sheet__btn--pressed"
            onTap={canConfirm ? onConfirm : undefined}
          >
            确定
          </Button>
        </View>
      </View>
    </View>
  );
}
