"use client";

import { TimerNotification } from "@/components/molecules/notification";
import { useUser } from "@/components/providers/user-provider";

export function TimerNotificationClient() {
  const { user } = useUser();
  return <TimerNotification time={user.timer} />;
}