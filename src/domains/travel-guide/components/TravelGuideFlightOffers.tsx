import { Text, View } from '@tarojs/components';
import type { TravelGuideFlightLeg, TravelGuideFlightOffer } from '@/types/travelGuide';
import { useT } from '@/hooks/useI18n';
import './TravelGuideFlightOffers.scss';

type TravelGuideFlightOffersProps = {
  offers: TravelGuideFlightOffer[];
  cabinFallback?: boolean;
  requestedCabinLabel?: string;
  actualCabinLabel?: string;
};

function formatOfferPrice(offer: TravelGuideFlightOffer): string {
  const amount = Math.round(offer.pricePerAdult);
  if (offer.currency === 'USD') return `$${amount}`;
  return `¥${amount}`;
}

function FlightLegRow({ label, leg }: { label: string; leg: TravelGuideFlightLeg }) {
  const hasTimes = Boolean(leg.depTime && leg.arrTime);
  const routeText =
    leg.depAirport && leg.arrAirport
      ? `${leg.depAirport} → ${leg.arrAirport}`
      : leg.route.replace(/→/g, ' → ');

  return (
    <View className="s-travel-guide-flight-offers__leg">
      <View className="s-travel-guide-flight-offers__leg-head">
        <Text className="s-travel-guide-flight-offers__leg-label">{label}</Text>
        <Text className="s-travel-guide-flight-offers__leg-route">{routeText}</Text>
        <Text className="s-travel-guide-flight-offers__leg-badge">
          {leg.stopsLabel}
        </Text>
      </View>
      {hasTimes ? (
        <View className="s-travel-guide-flight-offers__leg-time-row">
          <Text className="s-travel-guide-flight-offers__leg-time">{leg.depTime}</Text>
          <View className="s-travel-guide-flight-offers__leg-time-line" aria-hidden>
            <View className="s-travel-guide-flight-offers__leg-time-dot" />
            <View className="s-travel-guide-flight-offers__leg-time-bar" />
            <View className="s-travel-guide-flight-offers__leg-time-dot" />
          </View>
          <Text className="s-travel-guide-flight-offers__leg-time">{leg.arrTime}</Text>
        </View>
      ) : null}
      {leg.flightNumbers?.length ? (
        <Text className="s-travel-guide-flight-offers__leg-flights">
          {leg.flightNumbers.join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}

export function TravelGuideFlightOffers({
  offers,
  cabinFallback = false,
  requestedCabinLabel,
  actualCabinLabel,
}: TravelGuideFlightOffersProps) {
  const t = useT();
  if (!offers.length) return null;

  const showFallbackNotice =
    cabinFallback &&
    Boolean(requestedCabinLabel) &&
    Boolean(actualCabinLabel) &&
    requestedCabinLabel !== actualCabinLabel;

  return (
    <View className="s-travel-guide-flight-offers">
      <Text className="s-travel-guide-flight-offers__heading">
        {t('travelGuide.flightOffersHeading')}
      </Text>
      {showFallbackNotice ? (
        <Text className="s-travel-guide-flight-offers__fallback">
          {t('travelGuide.flightCabinFallback', {
            requested: requestedCabinLabel!,
            actual: actualCabinLabel!,
          })}
        </Text>
      ) : null}
      {offers.map((offer, index) => (
        <View
          key={`${offer.outbound.route}-${offer.pricePerAdult}-${index}`}
          className="s-travel-guide-flight-offers__card"
        >
          <View className="s-travel-guide-flight-offers__card-body">
            <FlightLegRow
              label={t('travelGuide.flightOutbound')}
              leg={offer.outbound}
            />
            {offer.return?.route ? (
              <FlightLegRow label={t('travelGuide.flightReturn')} leg={offer.return} />
            ) : null}
          </View>
          <View className="s-travel-guide-flight-offers__price-block">
            {offer.cabinLabel ? (
              <Text className="s-travel-guide-flight-offers__cabin">
                {offer.cabinLabel}
              </Text>
            ) : null}
            <Text className="s-travel-guide-flight-offers__price">
              {formatOfferPrice(offer)}
            </Text>
            <Text className="s-travel-guide-flight-offers__price-suffix">
              {t('travelGuide.flightPerPerson')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
