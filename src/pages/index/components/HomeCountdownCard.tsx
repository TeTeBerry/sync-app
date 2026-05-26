import type { FC } from "react";
import { useMemo } from "react";
import { useCountdown } from "../../../hooks/useCountdown";
import { getTomorrowlandChinaCountdownTarget } from "../../../utils/countdown";

type HomeCountdownCardProps = {
  eventName?: string;
  targetAt?: Date;
};

export const HomeCountdownCard: FC<HomeCountdownCardProps> = ({
  eventName = "Tomorrowland China",
  targetAt,
}) => {
  const target = useMemo(
    () => targetAt ?? getTomorrowlandChinaCountdownTarget(),
    [targetAt],
  );
  const parts = useCountdown(target);

  return (
    <section className="s-home-countdown" aria-label={`${eventName} countdown`}>
      <div className="s-home-countdown__timer">
        {parts.map((part, index) => (
          <div key={part.unit} className="s-home-countdown__part">
            <span
              className={
                part.accent ? "s-home-countdown__num s-home-countdown__num--accent" : "s-home-countdown__num"
              }
            >
              {part.value}
            </span>
            <span className="s-home-countdown__unit">{part.unit}</span>
            {index < parts.length - 1 && <span className="s-home-countdown__sep">·</span>}
          </div>
        ))}
      </div>
      <p className="s-home-countdown__copy">
        距<span>{eventName}</span>开场还有
      </p>
    </section>
  );
};
