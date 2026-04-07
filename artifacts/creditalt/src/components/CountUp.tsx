import { useState, useEffect } from "react";

interface Props {
  to: number;
  duration?: number;
}

export default function CountUp({ to, duration = 1500 }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (to === 0) {
      setCurrent(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * to));
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [to, duration]);

  return <>{current.toLocaleString("en-IN")}</>;
}
