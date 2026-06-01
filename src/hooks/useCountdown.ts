import { useEffect, useState } from 'react';
import type { CountdownPart } from '../pages/index/homeData';
import { EMPTY_COUNTDOWN_PARTS, getCountdownParts } from '../utils/countdown';

function isValidCountdownTarget(target: Date | null | undefined): target is Date {
  return target instanceof Date && !Number.isNaN(target.getTime());
}

export function useCountdown(target: Date | null | undefined): CountdownPart[] {
  const validTarget = isValidCountdownTarget(target) ? target : null;
  const [parts, setParts] = useState<CountdownPart[]>(() =>
    validTarget ? getCountdownParts(validTarget) : EMPTY_COUNTDOWN_PARTS,
  );

  useEffect(() => {
    if (!validTarget) {
      setParts(EMPTY_COUNTDOWN_PARTS);
      return;
    }
    const tick = () => setParts(getCountdownParts(validTarget));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [validTarget]);

  return parts;
}
