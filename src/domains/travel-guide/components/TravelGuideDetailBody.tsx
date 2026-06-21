import type { TravelGuidePlan } from '@/types/travelGuide';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  TravelGuideDetailBulletList,
  TravelGuideDetailNamedItem,
  TravelGuideDetailSection,
} from './TravelGuideDetailSection';

type TravelGuideDetailBodyProps = {
  plan: TravelGuidePlan;
};

export function TravelGuideDetailBody({ plan }: TravelGuideDetailBodyProps) {
  const t = useT();
  const accommodationSchemes = plan.accommodation.schemes ?? [];
  const featuredHotelNames = new Set(accommodationSchemes.map((s) => s.name));
  const moreHotels = plan.accommodation.hotels.filter(
    (hotel) => !featuredHotelNames.has(hotel.name),
  );

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
        <TravelGuideDetailBulletList items={plan.transport.lines} />
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

      <TravelGuideDetailSection title={plan.accommodation.title} accent="hotel">
        <View className="s-travel-guide-detail__scheme-grid">
          {accommodationSchemes.map((scheme) => (
            <View key={scheme.label} className="s-travel-guide-detail__scheme">
              <Text className="s-travel-guide-detail__scheme-label">
                {scheme.label}
              </Text>
              <Text className="s-travel-guide-detail__scheme-name">{scheme.name}</Text>
              <Text className="s-travel-guide-detail__scheme-note">{scheme.note}</Text>
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
          <TravelGuideDetailBulletList
            items={plan.budget.items.map(
              (item: { label: string; range: string; note?: string }) =>
                `${item.label}: ${item.range}${item.note ? ` (${item.note})` : ''}`,
            )}
          />
        </TravelGuideDetailSection>
      ) : null}

      {plan.essentials?.network.length ? (
        <TravelGuideDetailSection title={plan.essentials.title} accent="essentials">
          <Text className="s-travel-guide-detail__subsection-title">
            {t('travelGuide.network')}
          </Text>
          <TravelGuideDetailBulletList items={plan.essentials.network} />
        </TravelGuideDetailSection>
      ) : null}
      {plan.essentials?.payment.length ? (
        <TravelGuideDetailSection title={plan.essentials.title} accent="essentials">
          <Text className="s-travel-guide-detail__subsection-title">
            {t('travelGuide.payment')}
          </Text>
          <TravelGuideDetailBulletList items={plan.essentials.payment} />
        </TravelGuideDetailSection>
      ) : null}
      {plan.essentials?.apps.length ? (
        <TravelGuideDetailSection title={plan.essentials.title} accent="essentials">
          <Text className="s-travel-guide-detail__subsection-title">
            {t('travelGuide.essentialApps')}
          </Text>
          <TravelGuideDetailBulletList items={plan.essentials.apps} />
        </TravelGuideDetailSection>
      ) : null}
    </>
  );
}
