"use client";

import { useEffect, useRef } from "react";

interface TimerNotificationProps {
  time: string;
}

export function TimerNotification({ time }: TimerNotificationProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (!time) return;

    Notification.requestPermission().then((permission) => {
      if (permission !== "granted") return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const now = new Date();
      const [hoursStr, minutesStr] = time.split(":");
      const target = new Date();

      target.setHours(parseInt(hoursStr, 10));
      target.setMinutes(parseInt(minutesStr, 10));
      target.setSeconds(0);
      target.setMilliseconds(0);

      if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);

      const delay = target.getTime() - now.getTime();

      timeoutRef.current = setTimeout(() => {
        new Notification("SV Kassa notification", {
          body: `It's ${time} now: close the day!`,
        });
      }, delay);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [time]);

  return null;
}
