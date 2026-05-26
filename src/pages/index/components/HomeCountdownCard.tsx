import type { FC } from "react";
import { useCountdown } from "../../../hooks/useCountdown";

type HomeCountdownCardProps = {
  eventName?: string;
  targetAt?: Date | null;
};

export const HomeCountdownCard: FC<HomeCountdownCardProps> = ({
  eventName,
  targetAt,
}) => {
  const hasTarget = targetAt != null && eventName != null && eventName.length > 0;
  const parts = useCountdown(hasTarget ? targetAt : null);
  const ariaLabel = hasTarget ? `${eventName} countdown` : "Upcoming activity countdown";

  return (
    <section className="s-home-countdown" aria-label={ariaLabel}>
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
        {hasTarget ? (
          <>
            距<span>{eventName}</span>开场还有
          </>
        ) : (
          "暂无即将开始的活动"
        )}
      </p>
    </section>
  );
};
