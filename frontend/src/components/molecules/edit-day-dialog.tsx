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
import { DatePicker } from "./date-picker";
import { EditDaySheet } from "../organisms/edit-day-sheet";
import { toast } from "sonner";
import { useUser } from "../providers/user-provider";
import { getAllShops } from "@/lib/api";
import { Shop } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

interface EditDayDialogProps {
  onSaved?: () => void;
}

export function EditDayDialog({ onSaved }: EditDayDialogProps) {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [openSheet, setOpenSheet] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadShops = async () => {
      if (!user) return;

      if (user.role === "CEO") {
        try {
          const allShops = await getAllShops();
          setShops(
            allShops
              .filter((s) => s.role === "SHOP")
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        } catch (err) {
          console.error("Failed to load shops", err);
        }
      } else if (user.role === "SHOP" && user.shopId) {
        const shopData = {
          id: user.shopId,
          name: user.name || "My Shop",
          role: "SHOP",
        };
        setShops([shopData]);
        setSelectedShop(shopData);
      }
    };

    loadShops();
  }, [user]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && !openSheet) {
      setSelectedDate(null);
      if (user?.role === "CEO") {
        setSelectedShop(null);
      }
    }
  };

  const handleGo = () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }
    if (!selectedShop) {
      toast.error("Please select a shop first");
      return;
    }
    setOpen(false);
    setOpenSheet(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <form>
          <DialogTrigger asChild>
            <Button className="disabled:opacity-50 w-50 transition text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[#414141]">
              Edit data
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px] border-black bg-[#292929] text-[#f0f0f0]">
            <DialogHeader>
              <DialogTitle>Edit data</DialogTitle>
              <DialogDescription className="text-[#f0f0f0]">
                Pick a date and shop to edit
              </DialogDescription>
            </DialogHeader>

            <DatePicker title="Date" value={selectedDate} onChange={setSelectedDate} />

            {/* Show the Select only if user is CEO */}
            {selectedDate && user?.role === "CEO" && shops.length > 0 && (
              <div className="mt-4">
                <p className="text-sm mb-1 text-[#f0f0f0]">Select shop</p>
                <Select
                  value={selectedShop?.id ?? undefined}
                  onValueChange={(val) =>
                    setSelectedShop(shops.find((s) => s.id === val) || null)
                  }
                >
                  <SelectTrigger className="w-48 justify-between bg-[#171717] border-0 text-[#f0f0f0] hover:bg-[#414141] hover:text-[#f0f0f0]">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#545454] text-[#f0f0f0]">
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-30 transition text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#363636]">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleGo}
                className="w-20 transition bg-[#595959] text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#646464]"
              >
                Go
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {openSheet && selectedDate && selectedShop && (
        <EditDaySheet
          formattedDate={`${selectedDate.getDate().toString().padStart(2, "0")}.${
            (selectedDate.getMonth() + 1).toString().padStart(2, "0")
          }.${selectedDate.getFullYear()}`}
          open={openSheet}
          onClose={() => {
            setOpenSheet(false);
            setSelectedDate(null);
            if (user?.role === "CEO") {
              setSelectedShop(null);
            }
          }}
          shopId={selectedShop.id}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
