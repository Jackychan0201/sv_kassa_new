"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/atoms/sheet";
import { toast } from "sonner";
import { useUser } from "@/components/providers/user-provider";
import { updateShopAccount } from "@/lib/api";
import { SheetFormField } from "@/components/molecules/sheet-form-field";
import { handleError } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface EditAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UpdateAccountBody {
  name?: string;
  email?: string;
  password?: string;
}

export function EditAccountSheet({ open, onOpenChange }: EditAccountSheetProps) {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name,
    email: user?.email,
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) handleReset();
  };

  const handleReset = () => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    const { name, email, password, confirmPassword } = form;

    if (!name || !email) {
      toast.error("Название и email обязательны");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      setLoading(true);

      const body: UpdateAccountBody = {};
      if (name !== user.name) body.name = name;
      if (email !== user.email) body.email = email;
      if (password.trim() !== "") body.password = password;

      const updated = await updateShopAccount(user.shopId, body);
      setUser({ ...user, ...updated });

      toast.success("Данные редактированы успешно!");
      handleOpenChange(false);
    } catch (err) {
      handleError(err, "Не удалось редактировать данные");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-black">
        <SheetHeader>
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Редактировать Данные Магазина</SheetTitle>
          <SheetDescription className="text-lg text-[var(--color-text-secondary)]">
            Обновление личной информации и данных для входа
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          <SheetFormField
            id="name"
            label="Название"
            value={form?.name || ""}
            onChange={(val) => handleChange("name", val)}
            placeholder="Введите название"
          />

          <SheetFormField
            id="email"
            label="Email"
            type="email"
            value={form?.email || ""}
            onChange={(val) => handleChange("email", val)}
            placeholder="Введите email"
          />

          <SheetFormField
            id="password"
            label="Новый Пароль"
            type="password"
            value={form.password}
            onChange={(val) => handleChange("password", val)}
            placeholder="Введите новый пароль"
          />

          <SheetFormField
            id="confirmPassword"
            label="Подтвердите Новый Пароль"
            type="password"
            value={form.confirmPassword}
            onChange={(val) => handleChange("confirmPassword", val)}
            placeholder="Подтвердите новый пароль"
          />
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
          <Button
            onClick={handleReset}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            Сбррос
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
