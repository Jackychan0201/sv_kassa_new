"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { toast } from "sonner";
import { useUser } from "../providers/user-provider";
import { Label } from "../atoms/label";
import { Input } from "../atoms/input";
import { saveReminderTime } from "@/lib/api";
import { handleError } from "@/lib/utils";

interface SetReminderDialogProps {
  onSaved?: () => void;
}

export function SetReminderDialog({ onSaved }: SetReminderDialogProps) {
  const { user, setTimer } = useUser();

  const [selectedTime, setSelectedTime] = useState<string>(user?.timer ?? "00:00");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedTime(user?.timer ?? "00:00");
  }, [user?.timer]);

  if (!user) return null;

  const handleOpenChange = (isOpen: boolean) => setOpen(isOpen);

  const handleReset = async () => {
    setSelectedTime("00:00");
    if (!user.shopId) return;

    try {
      await saveReminderTime(user.shopId, "00:00");
      setTimer("00:00");
      toast.info("Timer is reset!");
    } catch (err) {
      handleError(err, "Failed to reset a reminder");
    }
  };

  const handleOk = async () => {
    if (!user.shopId) return;

    try {
      const timeToSave = selectedTime ?? "00:00";
      await saveReminderTime(user.shopId, timeToSave);
      setTimer(timeToSave);
      toast.success(`The timer is set to ${timeToSave}`);
    } catch (err) {
      handleError(err, "Failed to save reminder");
    } finally {
      setOpen(false);
      onSaved?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button className="disabled:opacity-50 w-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[var(--color-bg-select-hover)]">
            Set reminder
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] border-black bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <DialogHeader>
            <DialogTitle>Set reminder</DialogTitle>
            <DialogDescription className="text-[var(--color-text-primary)]">
              {selectedTime && selectedTime !== "00:00"
                ? `The timer is set to ${selectedTime}`
                : "Timer is not set"}
            </DialogDescription>
          </DialogHeader>

          <Label htmlFor="time-picker">Time</Label>
          <Input
            className="w-30 bg-[var(--color-bg-select-content)] appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            id="time-picker"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />

          <DialogFooter className="!items-start">
            <DialogClose asChild>
              <Button
                className="w-30 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-button-bg-hover-type1)]"
                onClick={handleReset}
              >
                Reset
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleOk}
              className="w-20 transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-button-bg-hover-type2)]"
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
