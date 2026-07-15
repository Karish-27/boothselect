import { useEffect, useState } from "react";

export function useCountdown(seconds: number | null, onComplete?: () => void) {
  const [remaining, setRemaining] = useState<number>(seconds ?? 0);

  useEffect(() => {
    if (seconds === null) {
      setRemaining(0);
      return;
    }
    setRemaining(seconds);
    const started = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const next = Math.max(0, seconds - elapsed);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return remaining;
}