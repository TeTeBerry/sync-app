import './ExclusiveItineraryInfoModal.scss';
import { Sparkles, X } from '../../../components/icons';
import { Text, View } from '@tarojs/components';
import { useOverlayLock } from '../../../hooks/useOverlayLock';

const DEFAULT_TITLE = '专属电音行程';
const DEFAULT_MESSAGE = '选择你喜爱的 DJ，将根据官方演出表自动生成专属观演行程。';

export type ExclusiveItineraryInfoModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  /** Secondary action (e.g. jump to activity buddy feed). */
  secondaryCta?: { label: string; onClick: () => void };
  /** Feature explainer uses the sparkles icon; short hints omit it. */
  showIcon?: boolean;
};

export function ExclusiveItineraryInfoModal({
  open,
  onClose,
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  confirmText = '知道了',
  secondaryCta,
  showIcon = true,
}: ExclusiveItineraryInfoModalProps) {
  useOverlayLock(open);

  if (!open) {
    return null;
  }

  return (
    <View className="s-overlay s-exclusive-itinerary-info-modal" role="presentation">
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-exclusive-itinerary-info-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exclusive-itinerary-info-title"
      >
        <View
          className="s-exclusive-itinerary-info-modal__close"
          aria-label="关闭"
          onClick={onClose}
        >
          <X size={16} color="#8e8e93" aria-hidden />
        </View>

        <View
          className={[
            's-exclusive-itinerary-info-modal__body',
            !showIcon ? 's-exclusive-itinerary-info-modal__body--compact' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {showIcon ? (
            <View className="s-exclusive-itinerary-info-modal__icon-wrap" aria-hidden>
              <Sparkles size={26} className="s-exclusive-itinerary-info-modal__icon" />
            </View>
          ) : null}

          <Text
            id="exclusive-itinerary-info-title"
            className="s-exclusive-itinerary-info-modal__title"
          >
            {title}
          </Text>
          <Text className="s-exclusive-itinerary-info-modal__message">{message}</Text>
        </View>

        <View
          className={[
            's-exclusive-itinerary-info-modal__foot',
            secondaryCta && 's-exclusive-itinerary-info-modal__foot--dual',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {secondaryCta ? (
            <View
              className="s-exclusive-itinerary-info-modal__cta s-exclusive-itinerary-info-modal__cta--secondary"
              hoverClass="s-exclusive-itinerary-info-modal__cta--pressed"
              onClick={secondaryCta.onClick}
            >
              <Text className="s-exclusive-itinerary-info-modal__cta-label">
                {secondaryCta.label}
              </Text>
            </View>
          ) : null}
          <View
            className="s-exclusive-itinerary-info-modal__cta"
            hoverClass="s-exclusive-itinerary-info-modal__cta--pressed"
            onClick={onClose}
          >
            <Text className="s-exclusive-itinerary-info-modal__cta-label">
              {confirmText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
