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
import { useRouter } from "next/navigation";

interface SetReminderDialogProps {
  onSaved?: () => void;
}

export function SetReminderDialog({ onSaved }: SetReminderDialogProps) {
  const { user, setTimer } = useUser();
  const router = useRouter();
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
      toast.info("Напоминание сброшено!");
    } catch (err) {
      handleError(err, "Не удалось сбросить напоминание");
      router.push("/login");
    }
  };

  const handleOk = async () => {
    if (!user.shopId) return;

    try {
      const timeToSave = selectedTime ?? "00:00";
      await saveReminderTime(user.shopId, timeToSave);
      setTimer(timeToSave);
      toast.success(`Напоминание установлено на ${timeToSave}`);
    } catch (err) {
      handleError(err, "Не удалось установить напоминание");
      router.push("/login");
    } finally {
      setOpen(false);
      onSaved?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button className="disabled:opacity-50 w-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]">
            Установить напоминание
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] border-black bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <DialogHeader>
            <DialogTitle>Установить напоминание</DialogTitle>
            <DialogDescription className="text-[var(--color-text-primary)]">
              {selectedTime && selectedTime !== "00:00"
                ? `Напoминание установлено на ${selectedTime}`
                : "Напоминание не установлено"}
            </DialogDescription>
          </DialogHeader>

          <Label htmlFor="time-picker">Время</Label>
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
                Сброс
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleOk}
              className="w-20 transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-button-bg-hover-type2)]"
            >
              Ок
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
