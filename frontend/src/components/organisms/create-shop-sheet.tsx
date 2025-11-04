"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/atoms/sheet";
import { toast } from "sonner";
import { createShop } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { SheetFormField } from "@/components/molecules/sheet-form-field";
import { Label } from "../atoms/label";
import { handleError } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CreateShopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}

export function CreateShopSheet({ open, onOpenChange, onCreate }: CreateShopSheetProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "SHOP",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setForm({
      name: "",
      email: "",
      role: "SHOP",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    const { name, email, password, confirmPassword, role } = form;

    if (!name || !email || !password) {
      toast.error("Все поля обязательны для заполнения");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      setLoading(true);
      await createShop({ name, email, password, role });
      toast.success("Магазин создан успешно!");
      onCreate();
      onOpenChange(false);
      handleReset();
    } catch (err) {
      handleError(err, "Не удалось создать магазин");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-black"
      >
        <SheetHeader>
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Создать Новый Магазин</SheetTitle>
          <SheetDescription className="text-lg text-[var(--color-text-secondary)]">
            Добвать новый магазин в вашу систему.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          <SheetFormField
            id="name"
            label="Название"
            value={form.name}
            onChange={(val) => handleChange("name", val)}
            placeholder="Введите название магазина"
          />

          <SheetFormField
            id="email"
            label="Email"
            value={form.email}
            onChange={(val) => handleChange("email", val)}
            placeholder="Введите email"
            type="email"
          />

          <div>
            <Label htmlFor="role" className="text-md text-[var(--color-text-primary)] ml-6">Роль:</Label>
            <Select
              value={form.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger className="w-[90%] mx-auto justify-between bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)]">
                <SelectItem value="SHOP">SHOP</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SheetFormField
            id="password"
            label="Пароль"
            value={form.password}
            onChange={(val) => handleChange("password", val)}
            placeholder="Введите пароль"
            type="password"
          />

          <SheetFormField
            id="confirmPassword"
            label="Подтвердите Пароль"
            value={form.confirmPassword}
            onChange={(val) => handleChange("confirmPassword", val)}
            placeholder="Подтвердите пароль"
            type="password"
          />
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Создание..." : "Создать магазин"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
