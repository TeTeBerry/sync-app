import { CalendarIcon, CheckIcon, FlameIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { memo, useCallback, useState, type FC, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { go, goPindan, ROUTES } from "../../../utils/route";
import type { EventSignupItem } from "../mockData";
import { SectionChevronLink } from "./SectionChevronLink";

export type HomeEventSignupProps = {
  items: EventSignupItem[];
};

const SignupCard = memo(function SignupCard({ item }: { item: EventSignupItem }) {
  const { t } = useTranslation();
  const [going, setGoing] = useState(item.going);

  const handleGoing = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setGoing((prev) => !prev);
    },
    [],
  );

  const handleFindBuddy = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      goPindan(item.id);
    },
    [item.id],
  );

  return (
    <article className="s-signup-card">
      <div className="s-signup-card__media">
        <img className="s-signup-card__img" src={item.image} alt={item.title} />
        {item.hot && (
          <span className="s-signup-card__hot">
            <FlameIcon size={10} />
            {t("common.hot")}
          </span>
        )}
        <span className="s-signup-card__category">{item.category}</span>
      </div>

      <div className="s-signup-card__body">
        <h3 className="s-signup-card__title">{item.title}</h3>

        <div className="s-signup-card__meta">
          <span className="s-signup-card__meta-item">
            <CalendarIcon size={12} />
            {item.date}
          </span>
          <span className="s-signup-card__meta-item">
            <MapPinIcon size={12} />
            {item.location}
          </span>
        </div>

        <div className="s-signup-card__stats">
          <UsersIcon size={12} />
          <span>
            {t("home.signup.attendees", { count: item.attendees })}
            <span className="s-signup-card__stats-dot"> · </span>
            {t("home.signup.pinOrders", { count: item.pinCount })}
          </span>
        </div>

        <div className="s-signup-card__actions">
          <button
            type="button"
            className={`s-signup-card__btn s-signup-card__btn--ghost${going ? " s-signup-card__btn--going" : ""}`}
            onClick={handleGoing}
          >
            <CheckIcon size={14} />
            {going ? t("home.signup.going") : t("home.signup.wantGo")}
          </button>
          <button type="button" className="s-signup-card__btn s-signup-card__btn--primary" onClick={handleFindBuddy}>
            <UsersIcon size={14} />
            {t("home.signup.findBuddy")}
          </button>
        </div>
      </div>
    </article>
  );
});

export const HomeEventSignup: FC<HomeEventSignupProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <section className="s-signup-section">
      <div className="s-home-section__top">
        <div className="s-home-section__heading">
          <CalendarIcon size={15} />
          <span>{t("home.signup.title")}</span>
        </div>
        <SectionChevronLink labelKey="common.all" onNavigate={() => go(ROUTES.EVENTS)} />
      </div>

      <div className="s-signup-section__tracks s-scrollbar-none">
        <div className="s-signup-section__tracks-inner">
          {items.map((item) => (
            <SignupCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};
