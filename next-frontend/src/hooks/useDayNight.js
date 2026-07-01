"use client";
import { useEffect, useState } from 'react';

/** Day: 6:00–17:59 local time. Night: 18:00–5:59 */
export function isDaytime(hour = new Date().getHours()) {
  return hour >= 6 && hour < 18;
}

export function useDayNight() {
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const update = () => setIsDay(isDaytime());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return isDay;
}