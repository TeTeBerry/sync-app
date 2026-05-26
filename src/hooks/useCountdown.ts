import { useEffect, useState } from "react";
import type { CountdownPart } from "../pages/index/homeData";
import { getCountdownParts } from "../utils/countdown";

export function useCountdown(target: Date): CountdownPart[] {
  const [parts, setParts] = useState(() => getCountdownParts(target));

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return parts;
}
