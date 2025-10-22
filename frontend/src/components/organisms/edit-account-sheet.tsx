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
      toast.error("Name and email are required");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
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

      toast.success("Account updated successfully!");
      handleOpenChange(false);
    } catch (err) {
      handleError(err, "Failed to save account changes");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-black">
        <SheetHeader>
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Edit Account Data</SheetTitle>
          <SheetDescription className="text-lg text-[var(--color-text-secondary)]">
            Update your personal and login information
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          <SheetFormField
            id="name"
            label="Name"
            value={form?.name || ""}
            onChange={(val) => handleChange("name", val)}
            placeholder="Enter your name"
          />

          <SheetFormField
            id="email"
            label="Email"
            type="email"
            value={form?.email || ""}
            onChange={(val) => handleChange("email", val)}
            placeholder="Enter your email"
          />

          <SheetFormField
            id="password"
            label="New Password"
            type="password"
            value={form.password}
            onChange={(val) => handleChange("password", val)}
            placeholder="Enter new password"
          />

          <SheetFormField
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(val) => handleChange("confirmPassword", val)}
            placeholder="Confirm new password"
          />
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Saving..." : "Save changes"}
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
