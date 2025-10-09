"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import { Label } from "@/components/atoms/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";

interface DatePickerProps {
  title: string;
  value?: Date | null;
  onChange?: (date: Date) => void;
}

export function DatePicker({ title, value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(undefined);

  const selectedDate = value ?? internalDate;

  const handleSelect = (date?: Date) => {
    if (!date) return;
    if (onChange) {
      onChange(date);
    } else {
      setInternalDate(date);
    }
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        {title}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            className="w-48 text-[#f0f0f0] justify-between font-normal hover:bg-[#414141]"
          >
            {selectedDate
              ? selectedDate.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 shadow-none bg-[#545454] border border-black"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={handleSelect}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
