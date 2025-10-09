"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/atoms/sheet";
import { Input } from "../atoms/input";
import { Label } from "../atoms/label";
import { toast } from "sonner";
import { getRecordByDate, postDailyRecord, updateDailyRecord } from "@/lib/api";
import { Button } from "../atoms/button";
import { DailyRecord } from "@/lib/types";
import { LoadingFallback } from "../molecules/loading-fallback";
import { useUser } from "../providers/user-provider";

interface EditDaySheetProps {
  formattedDate: string;
  open: boolean;
  shopId: string;
  onClose?: () => void;
  onSaved?: () => void;
}

export function EditDaySheet({ formattedDate, open, shopId, onClose, onSaved }: EditDaySheetProps) {
  const { user } = useUser();
  const [internalOpen, setInternalOpen] = useState(open);
  const [mainStockValue, setMainStockValue] = useState("");
  const [orderStockValue, setOrderStockValue] = useState("");
  const [mainRevenueWithMargin, setMainRevenueWithMargin] = useState("");
  const [mainRevenueWithoutMargin, setMainRevenueWithoutMargin] = useState("");
  const [orderRevenueWithMargin, setOrderRevenueWithMargin] = useState("");
  const [orderRevenueWithoutMargin, setOrderRevenueWithoutMargin] = useState("");
  const [record, setRecord] = useState<DailyRecord[] | null>(null);

  const today = new Date();
  const formattedToday = `${today.getDate().toString().padStart(2,"0")}.${
    (today.getMonth()+1).toString().padStart(2,"0")
  }.${today.getFullYear()}`;

  useEffect(() => {
    setInternalOpen(open);
    if (open) loadRecord();
  }, [open, shopId]);

  const handleOpenChange = (isOpen: boolean) => {
    setInternalOpen(isOpen);
    if (!isOpen) onClose?.();
  };

  const loadRecord = async () => {
    try {
      const data = await getRecordByDate(formattedDate);
      const shopRecord = data.find((r) => r.shopId === shopId);
      setRecord(shopRecord ? [shopRecord] : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!record || record.length === 0) {
      handleReset();
    } else {
      const r = record[0];
      setMainStockValue(r.mainStockValue.toFixed(2));
      setOrderStockValue(r.orderStockValue.toFixed(2));
      setMainRevenueWithMargin(r.revenueMainWithMargin.toFixed(2));
      setMainRevenueWithoutMargin(r.revenueMainWithoutMargin.toFixed(2));
      setOrderRevenueWithMargin(r.revenueOrderWithMargin.toFixed(2));
      setOrderRevenueWithoutMargin(r.revenueOrderWithoutMargin.toFixed(2));
    }
  }, [record]);

  const handleSave = async () => {
    try {
      const fields = [
        { label: "Main stock value", value: mainStockValue },
        { label: "Order stock value", value: orderStockValue },
        { label: "Revenue main stock (with margin)", value: mainRevenueWithMargin },
        { label: "Revenue main stock (without margin)", value: mainRevenueWithoutMargin },
        { label: "Revenue order stock (with margin)", value: orderRevenueWithMargin },
        { label: "Revenue order stock (without margin)", value: orderRevenueWithoutMargin },
      ];

      for (const field of fields) {
        if (field.value.trim() !== "" && isNaN(Number(field.value))) {
          toast.error(`${field.label} must be a valid number`);
          return;
        }
      }

      if (record && record.length > 0) {
        await updateDailyRecord({
          id: record[0].id,
          mainStockValue: Number(mainStockValue),
          orderStockValue: Number(orderStockValue),
          revenueMainWithMargin: Number(mainRevenueWithMargin),
          revenueMainWithoutMargin: Number(mainRevenueWithoutMargin),
          revenueOrderWithMargin: Number(orderRevenueWithMargin),
          revenueOrderWithoutMargin: Number(orderRevenueWithoutMargin),
        });
      } else {
        await postDailyRecord({
          shopId,
          mainStockValue: Number(mainStockValue),
          orderStockValue: Number(orderStockValue),
          revenueMainWithMargin: Number(mainRevenueWithMargin),
          revenueMainWithoutMargin: Number(mainRevenueWithoutMargin),
          revenueOrderWithMargin: Number(orderRevenueWithMargin),
          revenueOrderWithoutMargin: Number(orderRevenueWithoutMargin),
          recordDate: formattedDate,
        });
      }

      toast.success("Data saved successfully!");
      handleOpenChange(false);
      if (formattedDate === formattedToday) onSaved?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to save record");
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

  return (
    <Sheet open={internalOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="h-full flex flex-col bg-[#292929] border-black">
        <SheetHeader>
          <SheetTitle className="text-xl text-[#f0f0f0]">Edit day</SheetTitle>
          <SheetDescription className="text-lg text-[#b7b7b7]">
            Editing data for {formattedDate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {!record ? (
            <LoadingFallback message="Loading record..." />
          ) : (
            <>
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
                  autoComplete="off"
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
                  placeholder="e.g. 5333.43"
                  autoComplete="off"
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
                  placeholder="e.g. 66332.92"
                  autoComplete="off"
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
                  placeholder="e.g. 244.50"
                  autoComplete="off"
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
                  placeholder="e.g. 789.11"
                  autoComplete="off"
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
                  placeholder="e.g. 422.49"
                  autoComplete="off"
                />
              </div>
            </>
          )}
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
