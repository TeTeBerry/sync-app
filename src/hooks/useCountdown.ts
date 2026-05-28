import { useEffect, useState } from "react";
import type { CountdownPart } from "../pages/index/homeData";
import { EMPTY_COUNTDOWN_PARTS, getCountdownParts } from "../utils/countdown";

export function useCountdown(target: Date | null | undefined): CountdownPart[] {
  const [parts, setParts] = useState<CountdownPart[]>(() =>
    target ? getCountdownParts(target) : EMPTY_COUNTDOWN_PARTS,
  );

  useEffect(() => {
    if (!target) {
      setParts(EMPTY_COUNTDOWN_PARTS);
      return;
    }
    const tick = () => setParts(getCountdownParts(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}
