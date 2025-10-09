"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/atoms/sheet";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { toast } from "sonner";
import { postDailyRecord } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import { LoadingFallback } from "@/components/molecules/loading-fallback";

interface CloseDaySheetProps {
  disabled?: boolean;
  formattedDate: string;
  onSaved?: () => void;
  shopId?: string;
  shopName?: string;
  open?: boolean;         
  onClose?: () => void; 
}

export function CloseDaySheet({
  disabled,
  formattedDate,
  onSaved,
  shopId,
  shopName,
  open = false,
  onClose,
}: CloseDaySheetProps) {
  const { user } = useUser();
  const [internalOpen, setInternalOpen] = useState(open);

  const [mainStockValue, setMainStockValue] = useState("");
  const [orderStockValue, setOrderStockValue] = useState("");
  const [mainRevenueWithMargin, setMainRevenueWithMargin] = useState("");
  const [mainRevenueWithoutMargin, setMainRevenueWithoutMargin] = useState("");
  const [orderRevenueWithMargin, setOrderRevenueWithMargin] = useState("");
  const [orderRevenueWithoutMargin, setOrderRevenueWithoutMargin] = useState("");

  const handleOpenChange = (isOpen: boolean) => {
    setInternalOpen(isOpen);
    if (!isOpen) {
      handleReset();
      onClose?.();
    }
  };

  const handleReset = () => {
    setMainStockValue("");
    setOrderStockValue("");
    setMainRevenueWithMargin("");
    setMainRevenueWithoutMargin("");
    setOrderRevenueWithMargin("");
    setOrderRevenueWithoutMargin("");
  };

  const handleSave = async () => {
    const fields = [
      { label: "Main stock value", value: mainStockValue },
      { label: "Order stock value", value: orderStockValue },
      { label: "Revenue main stock (with margin)", value: mainRevenueWithMargin },
      { label: "Revenue main stock (without margin)", value: mainRevenueWithoutMargin },
      { label: "Revenue order stock (with margin)", value: orderRevenueWithMargin },
      { label: "Revenue order stock (without margin)", value: orderRevenueWithoutMargin },
    ];

    for (const field of fields) {
      if (field.value.trim() === "") {
        toast.error(`${field.label} cannot be empty`);
        return;
      }
      if (isNaN(Number(field.value))) {
        toast.error(`${field.label} must be a valid number`);
        return;
      }
    }

    if (!user) {
      return <LoadingFallback message="Loading user info..." />;
    }

    try {
      const record = {
        shopId: shopId || user.shopId as string,
        mainStockValue: Number(fields[0].value),
        orderStockValue: Number(fields[1].value),
        revenueMainWithMargin: Number(fields[2].value),
        revenueMainWithoutMargin: Number(fields[3].value),
        revenueOrderWithMargin: Number(fields[4].value),
        revenueOrderWithoutMargin: Number(fields[5].value),
        recordDate: formattedDate,
      };

      await postDailyRecord(record);
      toast.success("Data saved successfully!");
      onSaved?.();
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save record");
    }
  };

  return (
    <Sheet open={internalOpen} onOpenChange={handleOpenChange}>
      {!open && (
        <SheetTrigger asChild>
          <Button
            disabled={disabled}
            className="disabled:opacity-50 w-50 transition text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[#414141]"
          >
            Close the day
          </Button>
        </SheetTrigger>
      )}

      <SheetContent
        side="right"
        className="h-full flex flex-col bg-[#292929] border-black"
      >
        <SheetHeader>
          <SheetTitle className="text-xl text-[#f0f0f0]">Close the day</SheetTitle>
          <SheetDescription className="flex flex-col text-lg text-[#b7b7b7]">
            <Label className="text-lg">Close the day for {formattedDate}</Label>
            {shopName && <Label className="text-base">{shopName}</Label>}
          </SheetDescription>
        </SheetHeader>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="mainStockValue" className="text-md text-[#f0f0f0] ml-6">
              Main stock value:
            </Label>
            <Input
              id="mainStockValue"
              value={mainStockValue}
              onChange={(e) => setMainStockValue(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="e.g. 12345.00"
            />
          </div>

          <div>
            <Label htmlFor="orderStockValue" className="text-md text-[#f0f0f0] ml-6">
              Order stock value:
            </Label>
            <Input
              id="orderStockValue"
              value={orderStockValue}
              onChange={(e) => setOrderStockValue(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="e.g. 5678.00"
            />
          </div>

          <div>
            <Label htmlFor="mainRevenueWithMargin" className="text-md text-[#f0f0f0] ml-6">
              Revenue main stock (with margin):
            </Label>
            <Input
              id="mainRevenueWithMargin"
              value={mainRevenueWithMargin}
              onChange={(e) => setMainRevenueWithMargin(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="e.g. 8000.00"
            />
          </div>

          <div>
            <Label htmlFor="mainRevenueWithoutMargin" className="text-md text-[#f0f0f0] ml-6">
              Revenue main stock (without margin):
            </Label>
            <Input
              id="mainRevenueWithoutMargin"
              value={mainRevenueWithoutMargin}
              onChange={(e) => setMainRevenueWithoutMargin(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="e.g. 7000.00"
            />
          </div>

          <div>
            <Label htmlFor="orderRevenueWithMargin" className="text-md text-[#f0f0f0] ml-6">
              Revenue order stock (with margin):
            </Label>
            <Input
              id="orderRevenueWithMargin"
              value={orderRevenueWithMargin}
              onChange={(e) => setOrderRevenueWithMargin(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="e.g. 4000.00"
            />
          </div>

          <div>
            <Label htmlFor="orderRevenueWithoutMargin" className="text-md text-[#f0f0f0] ml-6">
              Revenue order stock (without margin):
            </Label>
            <Input
              id="orderRevenueWithoutMargin"
              value={orderRevenueWithoutMargin}
              onChange={(e) => setOrderRevenueWithoutMargin(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="e.g. 3500.00"
            />
          </div>
        </div>
          <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
            <Button
              onClick={handleSave}
              className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#414141]"
            >
              Save data
            </Button>
            <Button
              onClick={handleReset}
              className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#414141]"
            >
              Reset
            </Button>
          </div>
      </SheetContent>
    </Sheet>
  );
}
