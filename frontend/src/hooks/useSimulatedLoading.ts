import { useState, useEffect } from "react";

export function useSimulatedLoading(duration = 800) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  return isLoading;
}
