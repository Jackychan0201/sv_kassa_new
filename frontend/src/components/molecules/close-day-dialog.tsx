"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { toast } from "sonner";
import { Shop } from "@/lib/types";
import { CloseDaySheet } from "@/components/organisms/close-day-sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";

interface CloseDayDialogProps {
  shops: Shop[];
  disabled?: boolean;
  onClosed?: () => void;
  formattedDate: string;
}

export function CloseDayDialog({
  shops,
  disabled,
  onClosed,
  formattedDate,
}: CloseDayDialogProps) {
  const [open, setOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const handleGo = () => {
    if (!selectedShop) {
      toast.error("Please select a shop first");
      return;
    }
    setOpen(false);
    setOpenSheet(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <form>
          <DialogTrigger asChild>
            <Button
              disabled={disabled}
              className="disabled:opacity-50 w-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[var(--color-bg-select-hover)]"
            >
              Close day
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px] border-black bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
            <DialogHeader>
              <DialogTitle>Close shop day</DialogTitle>
            </DialogHeader>

            {/* Select shop using Select */}
            <div className="mt-4">
              <p className="text-sm mb-1 text-[var(--color-text-primary)]">Select shop</p>
              <Select
                value={selectedShop?.id ?? undefined}
                onValueChange={(val) => setSelectedShop(shops.find((s) => s.id === val) || null)}
              >
                <SelectTrigger className="w-48 justify-between bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)]">
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button className="w-24 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-button-bg-hover-type1)]">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="button"
                onClick={handleGo}
                className="w-28 transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-button-bg-hover-type2)]"
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {/* Instantly opens CloseDaySheet when Continue clicked */}
      {openSheet && selectedShop && (
        <CloseDaySheet
          open={openSheet}
          onClose={() => setOpenSheet(false)}
          formattedDate={formattedDate}
          shopId={selectedShop.id}
          shopName={selectedShop.name}
          onSaved={() => {
            setOpenSheet(false);
            toast.success(`${selectedShop.name} day closed successfully`);
            onClosed?.();
          }}
        />
      )}
    </>
  );
}
