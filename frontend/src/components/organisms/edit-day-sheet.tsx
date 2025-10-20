"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/atoms/sheet";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { getRecordByDate, postDailyRecord, updateDailyRecord } from "@/lib/api";
import { DailyRecord } from "@/lib/types";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { useUser } from "@/components/providers/user-provider";
import { handleError } from "@/lib/utils";
import { SheetFormField } from "@/components/molecules/sheet-form-field";

interface EditDaySheetProps {
  formattedDate: string;
  open: boolean;
  shopId: string;
  onClose?: () => void;
  onSaved?: () => void;
}

export function EditDaySheet({
  formattedDate,
  open,
  shopId,
  onClose,
  onSaved,
}: EditDaySheetProps) {
  const { user } = useUser();
  const [internalOpen, setInternalOpen] = useState(open);
  const [record, setRecord] = useState<DailyRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    mainStockValue: "",
    orderStockValue: "",
    mainRevenueWithMargin: "",
    mainRevenueWithoutMargin: "",
    orderRevenueWithMargin: "",
    orderRevenueWithoutMargin: "",
  });

  const today = new Date();
  const formattedToday = `${today.getDate().toString().padStart(2, "0")}.${
    (today.getMonth() + 1).toString().padStart(2, "0")
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
      handleError(err);
    }
  };

  useEffect(() => {
    if (!record || record.length === 0) {
      handleReset();
    } else {
      const r = record[0];
      setForm({
        mainStockValue: r.mainStockValue.toFixed(2),
        orderStockValue: r.orderStockValue.toFixed(2),
        mainRevenueWithMargin: r.revenueMainWithMargin.toFixed(2),
        mainRevenueWithoutMargin: r.revenueMainWithoutMargin.toFixed(2),
        orderRevenueWithMargin: r.revenueOrderWithMargin.toFixed(2),
        orderRevenueWithoutMargin: r.revenueOrderWithoutMargin.toFixed(2),
      });
    }
  }, [record]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setForm({
      mainStockValue: "",
      orderStockValue: "",
      mainRevenueWithMargin: "",
      mainRevenueWithoutMargin: "",
      orderRevenueWithMargin: "",
      orderRevenueWithoutMargin: "",
    });
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(form)) {
        if (value.trim() !== "" && isNaN(Number(value))) {
          toast.error(`${key} must be a valid number`);
          return;
        }
      }

      setLoading(true);

      if (record && record.length > 0) {
        await updateDailyRecord({
          id: record[0].id,
          mainStockValue: Number(form.mainStockValue),
          orderStockValue: Number(form.orderStockValue),
          revenueMainWithMargin: Number(form.mainRevenueWithMargin),
          revenueMainWithoutMargin: Number(form.mainRevenueWithoutMargin),
          revenueOrderWithMargin: Number(form.orderRevenueWithMargin),
          revenueOrderWithoutMargin: Number(form.orderRevenueWithoutMargin),
        });
      } else {
        await postDailyRecord({
          shopId,
          mainStockValue: Number(form.mainStockValue),
          orderStockValue: Number(form.orderStockValue),
          revenueMainWithMargin: Number(form.mainRevenueWithMargin),
          revenueMainWithoutMargin: Number(form.mainRevenueWithoutMargin),
          revenueOrderWithMargin: Number(form.orderRevenueWithMargin),
          revenueOrderWithoutMargin: Number(form.orderRevenueWithoutMargin),
          recordDate: formattedDate,
        });
      }

      toast.success("Data saved successfully!");
      handleOpenChange(false);
      if (formattedDate === formattedToday) onSaved?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  const inputFields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: "mainStockValue", label: "Main stock value", placeholder: "e.g. 12345.00" },
    { key: "orderStockValue", label: "Order stock value", placeholder: "e.g. 5333.43" },
    { key: "mainRevenueWithMargin", label: "Revenue main stock (with margin)", placeholder: "e.g. 66332.92" },
    { key: "mainRevenueWithoutMargin", label: "Revenue main stock (without margin)", placeholder: "e.g. 244.50" },
    { key: "orderRevenueWithMargin", label: "Revenue order stock (with margin)", placeholder: "e.g. 789.11" },
    { key: "orderRevenueWithoutMargin", label: "Revenue order stock (without margin)", placeholder: "e.g. 422.49" },
  ];

  return (
    <Sheet open={internalOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-black">
        <SheetHeader>
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Edit day</SheetTitle>
          <SheetDescription className="text-lg text-[var(--color-text-secondary)]">
            Editing data for {formattedDate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {!record ? (
            <LoadingFallback message="Loading record..." />
          ) : (
            inputFields.map((field) => (
              <SheetFormField
                key={field.key}
                id={field.key}
                label={field.label}
                value={form[field.key]}
                onChange={(value) => handleChange(field.key, value)}
                placeholder={field.placeholder}
              />
            ))
          )}
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Saving..." : "Save data"}
          </Button>
          <Button
            onClick={handleReset}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
