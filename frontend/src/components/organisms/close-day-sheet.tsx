"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/atoms/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { SheetFormField } from "@/components/molecules/sheet-form-field";
import { toast } from "sonner";
import { useUser } from "@/components/providers/user-provider";
import { postDailyRecord, getAllShops } from "@/lib/api";
import { handleError } from "@/lib/utils";
import type { Shop } from "@/lib/types";
import { useRouter } from "next/navigation";

interface CloseDaySheetProps {
  formattedDate: string;
  onSaved?: () => void;
  disabled?: boolean;
}

export function CloseDaySheet({ formattedDate, onSaved, disabled }: CloseDaySheetProps) {
  const { user } = useUser();
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    mainStockValue: "",
    orderStockValue: "",
    mainRevenueWithMargin: "",
    mainRevenueWithoutMargin: "",
    orderRevenueWithMargin: "",
    orderRevenueWithoutMargin: "",
  });

  const handleSheetOpenChange = (isOpen: boolean) => {
    setSheetOpen(isOpen);
    if (!isOpen) {
      setSelectedShop(user?.role === "SHOP" && user.shopId ? { id: user.shopId, name: user.name || "My Shop", role: "SHOP" } : null);
      handleReset();
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
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const normalizeNumber = (value: string): string => {
    return value.replace(/\s+/g, "").replace(",", ".");
  };

  const handleSave = async () => {
    if (!selectedShop) {
      toast.error("Пожалуйста, выберите магазин");
      return;
    }

    const fields: { label: string; value: string }[] = [
      { label: "Остатки ОСН", value: form.mainStockValue },
      { label: "Остатки ДОП", value: form.orderStockValue },
      { label: "Продажи ОСН (С Маржой)", value: form.mainRevenueWithMargin },
      { label: "Продажи ОСН (Без Маржи)", value: form.mainRevenueWithoutMargin },
      { label: "Продажи ДОП (С Маржой)", value: form.orderRevenueWithMargin },
      { label: "Продажи ДОП (Без Маржи)", value: form.orderRevenueWithoutMargin },
    ];

    for (const field of fields) {
      if (field.value.trim() === "") {
        toast.error(`${field.label} не может быть пустым`);
        return;
      }

      const normalized = normalizeNumber(field.value);

      if (isNaN(Number(normalized))) {
        toast.error(`${field.label} должны быть числом`);
        return;
      }
    }

    const mainWith = Number(normalizeNumber(form.mainRevenueWithMargin));
    const mainWithout = Number(normalizeNumber(form.mainRevenueWithoutMargin));
    if (mainWith < mainWithout) {
      toast.error("Продажи ОСН (С Маржой) должны быть больше или равны Продажи ОСН (Без Маржи)");
      return;
    }

    const orderWith = Number(normalizeNumber(form.orderRevenueWithMargin));
    const orderWithout = Number(normalizeNumber(form.orderRevenueWithoutMargin));
    if (orderWith < orderWithout) {
      toast.error("Продажи ДОП (С Маржой) должны быть больше или равны Продажи ДОП (Без Маржи)");
      return;
    }

    try {
      setLoading(true);

      await postDailyRecord({
        shopId: selectedShop.id,
        mainStockValue: Number(normalizeNumber(form.mainStockValue)),
        orderStockValue: Number(normalizeNumber(form.orderStockValue)),
        revenueMainWithMargin: Number(normalizeNumber(form.mainRevenueWithMargin)),
        revenueMainWithoutMargin: Number(normalizeNumber(form.mainRevenueWithoutMargin)),
        revenueOrderWithMargin: Number(normalizeNumber(form.orderRevenueWithMargin)),
        revenueOrderWithoutMargin: Number(normalizeNumber(form.orderRevenueWithoutMargin)),
        recordDate: formattedDate,
      });

      toast.success("Данные сохранены успешно!");
      handleSheetOpenChange(false);
      onSaved?.();
    } catch (err) {
      handleError(err, "Не удалось сохранить данные");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };


  // Load shops for CEO
  useEffect(() => {
    const loadShops = async () => {
      if (!user || !sheetOpen) return;

      if (user.role === "CEO") {
        try {
          const allShops = await getAllShops();
          setShops(allShops.filter(s => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
          handleError(err, "Не удалось загрузить магазины");
        }
      } else if (user.role === "SHOP" && user.shopId) {
        setShops([{ id: user.shopId, name: user.name || "My Shop", role: "SHOP" }]);
        setSelectedShop({ id: user.shopId, name: user.name || "My Shop", role: "SHOP" });
      }
    };
    loadShops();
  }, [sheetOpen, user]);

  const fieldsConfig = [
    { key: "mainStockValue", label: "Остатки ОСН", placeholder: "e.g. 12345.00" },
    { key: "orderStockValue", label: "Остатки ДОП", placeholder: "e.g. 5678.00" },
    { key: "mainRevenueWithoutMargin", label: "Продажи ОСН (Без Маржи)", placeholder: "e.g. 7000.00" },
    { key: "mainRevenueWithMargin", label: "Продажи ОСН (С Маржой)", placeholder: "e.g. 8000.00" },
    { key: "orderRevenueWithoutMargin", label: "Продажи ДОП (Без Маржи)", placeholder: "e.g. 3500.00" },
    { key: "orderRevenueWithMargin", label: "Продажи ДОП (С Маржой)", placeholder: "e.g. 4000.00" },
  ];

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button className="w-50 transition text-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-bg-select-hover)]">
          Закрыть смену
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-[var(--color-border)]">
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Закрыть смену</SheetTitle>
          <SheetDescription className="text-[var(--color-text-secondary)]">
            Закрыть смену за {formattedDate} {selectedShop && `(${selectedShop.name})`}
          </SheetDescription>
        </SheetHeader>

        {/* Shop selection for CEO */}
        {user?.role === "CEO" && (
          <div className="ml-6">
            <p className="text-sm mb-2 text-[var(--color-text-primary)]">Выберите магазин</p>
            <Select
              value={selectedShop?.id ?? ""}
              onValueChange={(val) => setSelectedShop(shops.find((s) => s.id === val) || null)}
            >
              <SelectTrigger className="w-48 bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] py-3 px-4">
                <SelectValue placeholder="Выберите магазин" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Form fields */}
        <div className="flex flex-col gap-4 py-6 border-t border-[var(--color-border)]">
          {fieldsConfig.map(field => (
            <SheetFormField
              key={field.key}
              id={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={form[field.key as keyof typeof form]}
              onChange={value => handleChange(field.key as keyof typeof form, value)}
              disabled={!selectedShop}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-auto flex flex-col gap-2 py-4 border-t border-[var(--color-border)]">
          <Button
            onClick={handleSave}
            disabled={!selectedShop || loading || disabled}
            className="w-[90%] mx-auto transition text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Сохранение..." : "Сохранить данные"}
          </Button>
          <Button
            onClick={handleReset}
            disabled={!selectedShop || disabled}
            className="w-[90%] mx-auto transition text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]"
          >
            Сброс
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
