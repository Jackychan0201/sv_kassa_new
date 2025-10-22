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
import { Label } from "@/components/atoms/label";
import { toast } from "sonner";
import { postDailyRecord } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { SheetFormField } from "@/components/molecules/sheet-form-field";
import { handleError } from "@/lib/utils";
import { useRouter } from "next/router";

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
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(open);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    mainStockValue: "",
    orderStockValue: "",
    mainRevenueWithMargin: "",
    mainRevenueWithoutMargin: "",
    orderRevenueWithMargin: "",
    orderRevenueWithoutMargin: "",
  });

  const handleOpenChange = (isOpen: boolean) => {
    setInternalOpen(isOpen);
    if (!isOpen) {
      handleReset();
      onClose?.();
    }
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

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const fields: { label: string; value: string }[] = [
      { label: "Main stock value", value: form.mainStockValue },
      { label: "Order stock value", value: form.orderStockValue },
      { label: "Revenue main stock (with margin)", value: form.mainRevenueWithMargin },
      { label: "Revenue main stock (without margin)", value: form.mainRevenueWithoutMargin },
      { label: "Revenue order stock (with margin)", value: form.orderRevenueWithMargin },
      { label: "Revenue order stock (without margin)", value: form.orderRevenueWithoutMargin },
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
      setLoading(true);

      const record = {
        shopId: shopId || (user.shopId as string),
        mainStockValue: Number(form.mainStockValue),
        orderStockValue: Number(form.orderStockValue),
        revenueMainWithMargin: Number(form.mainRevenueWithMargin),
        revenueMainWithoutMargin: Number(form.mainRevenueWithoutMargin),
        revenueOrderWithMargin: Number(form.orderRevenueWithMargin),
        revenueOrderWithoutMargin: Number(form.orderRevenueWithoutMargin),
        recordDate: formattedDate,
      };

      await postDailyRecord(record);
      toast.success("Data saved successfully!");
      onSaved?.();
      handleOpenChange(false);
    } catch (err) {
      handleError(err, "Failed to save record");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const fieldsConfig = [
    { key: "mainStockValue", label: "Main stock value", placeholder: "e.g. 12345.00" },
    { key: "orderStockValue", label: "Order stock value", placeholder: "e.g. 5678.00" },
    { key: "mainRevenueWithMargin", label: "Revenue main stock (with margin)", placeholder: "e.g. 8000.00" },
    { key: "mainRevenueWithoutMargin", label: "Revenue main stock (without margin)", placeholder: "e.g. 7000.00" },
    { key: "orderRevenueWithMargin", label: "Revenue order stock (with margin)", placeholder: "e.g. 4000.00" },
    { key: "orderRevenueWithoutMargin", label: "Revenue order stock (without margin)", placeholder: "e.g. 3500.00" },
  ];

  return (
    <Sheet open={internalOpen} onOpenChange={handleOpenChange}>
      {!open && (
        <SheetTrigger asChild>
          <Button
            disabled={disabled}
            className="disabled:opacity-50 w-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[var(--color-bg-select-hover)]"
          >
            Close the day
          </Button>
        </SheetTrigger>
      )}

      <SheetContent
        side="right"
        className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-black"
      >
        <SheetHeader>
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Close the day</SheetTitle>
          <SheetDescription className="flex flex-col text-lg text-[var(--color-text-secondary)]">
            <Label className="text-lg">Close the day for {formattedDate}</Label>
            {shopName && <Label className="text-base">{shopName}</Label>}
          </SheetDescription>
        </SheetHeader>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          {fieldsConfig.map((field) => (
            <SheetFormField
              key={field.key}
              id={field.key}
              label={field.label}
              value={form[field.key as keyof typeof form]}
              onChange={(value) => handleChange(field.key as keyof typeof form, value)}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        {/* Buttons */}
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
