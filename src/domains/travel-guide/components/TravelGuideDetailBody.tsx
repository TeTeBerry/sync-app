import type { TravelGuideBudgetTier, TravelGuidePlan } from '@/types/travelGuide';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { TravelGuideBudgetList } from './TravelGuideBudgetList';
import { TravelGuideFlightOffers } from './TravelGuideFlightOffers';
import {
  TravelGuideDetailBulletList,
  TravelGuideDetailNamedItem,
  TravelGuideDetailSection,
} from './TravelGuideDetailSection';
import { filterTransportLinesForFlightOffers } from '../utils/travelGuideFlightSampleLine.util';
import { resolveTravelGuideBudgetTier } from '../utils/travelGuideBudgetLabels';

type TravelGuideDetailBodyProps = {
  plan: TravelGuidePlan;
  selectedBudgetTier?: TravelGuideBudgetTier;
};

export function TravelGuideDetailBody({
  plan,
  selectedBudgetTier,
}: TravelGuideDetailBodyProps) {
  const t = useT();
  const resolvedBudgetTier = resolveTravelGuideBudgetTier(selectedBudgetTier);
  const flightTierQuote = plan.flightByTier?.[resolvedBudgetTier];
  const transportLines = filterTransportLinesForFlightOffers(
    plan.transport.lines,
    plan.transport.flightOffers,
  );
  const accommodationSchemes = plan.accommodation.schemes ?? [];
  const featuredHotelNames = new Set(accommodationSchemes.map((s) => s.name));
  const moreHotels = plan.accommodation.hotels.filter(
    (hotel) => !featuredHotelNames.has(hotel.name),
  );
  const showAccommodation =
    accommodationSchemes.length > 0 || plan.accommodation.hotels.length > 0;

  return (
    <>
      {plan.documents?.items.length ? (
        <TravelGuideDetailSection title={plan.documents.title} accent="docs">
          <TravelGuideDetailBulletList items={plan.documents.items} />
        </TravelGuideDetailSection>
      ) : null}

      {plan.tickets?.channels.length ? (
        <TravelGuideDetailSection title={plan.tickets.title} accent="ticket">
          {plan.tickets.channels.map((channel) => (
            <TravelGuideDetailNamedItem
              key={channel.name}
              title={channel.name}
              note={channel.note}
            />
          ))}
        </TravelGuideDetailSection>
      ) : null}

      <TravelGuideDetailSection title={plan.transport.title} accent="transport">
        {transportLines.length ? (
          <TravelGuideDetailBulletList items={transportLines} />
        ) : null}
        {plan.transport.flightOffers?.length ? (
          <TravelGuideFlightOffers
            offers={plan.transport.flightOffers}
            cabinFallback={flightTierQuote?.cabinFallback}
            requestedCabinLabel={flightTierQuote?.requestedCabinLabel}
            actualCabinLabel={flightTierQuote?.cabinLabel}
          />
        ) : null}
      </TravelGuideDetailSection>

      {plan.venueTransport?.options.length ? (
        <TravelGuideDetailSection title={plan.venueTransport.title} accent="venue">
          {plan.venueTransport.options.map((option) => (
            <View key={option.label} className="s-travel-guide-detail__option-block">
              <Text className="s-travel-guide-detail__option-label">
                {option.label}
              </Text>
              <TravelGuideDetailBulletList items={option.lines} />
            </View>
          ))}
        </TravelGuideDetailSection>
      ) : null}

      {showAccommodation ? (
        <TravelGuideDetailSection title={plan.accommodation.title} accent="hotel">
          <View className="s-travel-guide-detail__scheme-grid">
            {accommodationSchemes.map((scheme) => (
              <View key={scheme.label} className="s-travel-guide-detail__scheme">
                <Text className="s-travel-guide-detail__scheme-label">
                  {scheme.label}
                </Text>
                <Text className="s-travel-guide-detail__scheme-name">
                  {scheme.name}
                </Text>
                <Text className="s-travel-guide-detail__scheme-note">
                  {scheme.note}
                </Text>
                <Text className="s-travel-guide-detail__scheme-reason">
                  {scheme.reason}
                </Text>
                {scheme.bookingHint ? (
                  <Text className="s-travel-guide-detail__scheme-hint">
                    {t('travelGuide.bookingHint')} {scheme.bookingHint}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
          {moreHotels.length ? (
            <View className="s-travel-guide-detail__more-list">
              <Text className="s-travel-guide-detail__subsection-title">
                {t('travelGuide.moreOptions')}
              </Text>
              {moreHotels.map((hotel) => (
                <TravelGuideDetailNamedItem
                  key={hotel.name}
                  title={hotel.name}
                  note={hotel.note}
                  reason={hotel.reason}
                  bookingHint={hotel.bookingHint}
                />
              ))}
            </View>
          ) : null}
          {!accommodationSchemes.length
            ? plan.accommodation.hotels.map((hotel) => (
                <TravelGuideDetailNamedItem
                  key={hotel.name}
                  title={hotel.name}
                  note={hotel.note}
                  reason={hotel.reason}
                />
              ))
            : null}
        </TravelGuideDetailSection>
      ) : null}

      {plan.itinerary?.days.length ? (
        <TravelGuideDetailSection title={plan.itinerary.title} accent="itinerary">
          {plan.itinerary.days.map((day: { label: string; lines: string[] }) => (
            <View key={day.label} className="s-travel-guide-detail__day">
              <Text className="s-travel-guide-detail__day-label">{day.label}</Text>
              <TravelGuideDetailBulletList items={day.lines} />
            </View>
          ))}
        </TravelGuideDetailSection>
      ) : null}

      {plan.budget?.items.length ? (
        <TravelGuideDetailSection title={plan.budget.title} accent="budget">
          <TravelGuideBudgetList items={plan.budget.items} />
        </TravelGuideDetailSection>
      ) : null}

      {plan.essentials &&
      (plan.essentials.network.length ||
        plan.essentials.payment.length ||
        plan.essentials.apps.length) ? (
        <TravelGuideDetailSection title={plan.essentials.title} accent="essentials">
          {plan.essentials.network.length ? (
            <View className="s-travel-guide-detail__essentials-block">
              <Text className="s-travel-guide-detail__subsection-title">
                {t('travelGuide.network')}
              </Text>
              <TravelGuideDetailBulletList items={plan.essentials.network} />
            </View>
          ) : null}
          {plan.essentials.payment.length ? (
            <View className="s-travel-guide-detail__essentials-block">
              <Text className="s-travel-guide-detail__subsection-title">
                {t('travelGuide.payment')}
              </Text>
              <TravelGuideDetailBulletList items={plan.essentials.payment} />
            </View>
          ) : null}
          {plan.essentials.apps.length ? (
            <View className="s-travel-guide-detail__essentials-block">
              <Text className="s-travel-guide-detail__subsection-title">
                {t('travelGuide.essentialApps')}
              </Text>
              <TravelGuideDetailBulletList items={plan.essentials.apps} />
            </View>
          ) : null}
        </TravelGuideDetailSection>
      ) : null}
    </>
  );
}
