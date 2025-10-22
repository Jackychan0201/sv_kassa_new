"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/atoms/sheet";
import { toast } from "sonner";
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

interface Shop {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EditShopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: Shop | null;
  onUpdate: (updatedShop: Shop) => void;
}

interface UpdateShopBody {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
}

export function EditShopSheet({
  open,
  onOpenChange,
  shop,
  onUpdate,
}: EditShopSheetProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "SHOP",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name,
        email: shop.email,
        role: shop.role,
        password: "",
        confirmPassword: "",
      });
    }
  }, [shop]);

  if (!shop) return null;

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (shop) {
      setForm({
        name: shop.name,
        email: shop.email,
        role: shop.role,
        password: "",
        confirmPassword: "",
      });
    }
  };

  const handleSave = async () => {
    const { name, email, role, password, confirmPassword } = form;
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
      const body: UpdateShopBody = {};
      if (name !== shop.name) body.name = name;
      if (email !== shop.email) body.email = email;
      if (role !== shop.role) body.role = role;
      if (password.trim() !== "") body.password = password;

      const res = await fetch(`/api/shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update shop");
      }

      const updated: Shop = await res.json();
      toast.success("Shop updated successfully!");
      onUpdate(updated);
      onOpenChange(false);
    } catch (err) {
      handleError(err, "Failed to save changes");
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
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">
            Edit Shop Data
          </SheetTitle>
          <SheetDescription className="text-lg text-[var(--color-text-secondary)]">
            Modify this shop’s name, email, role, or password.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          <SheetFormField
            id="name"
            label="Name"
            value={form.name}
            onChange={(val) => handleChange("name", val)}
            placeholder="Enter shop name"
          />

          <SheetFormField
            id="email"
            label="Email"
            value={form.email}
            onChange={(val) => handleChange("email", val)}
            placeholder="Enter email"
            type="email"
          />

          <div>
            <Label htmlFor="role" className="text-md text-[var(--color-text-primary)] ml-6">
              Role:
            </Label>
            <Select value={form.role} onValueChange={(val) => handleChange("role", val)}>
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
            label="New Password"
            value={form.password}
            onChange={(val) => handleChange("password", val)}
            placeholder="Enter new password"
            type="password"
          />

          <SheetFormField
            id="confirmPassword"
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={(val) => handleChange("confirmPassword", val)}
            placeholder="Confirm new password"
            type="password"
          />
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Saving..." : "Save Changes"}
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
