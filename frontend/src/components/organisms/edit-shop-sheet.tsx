"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/atoms/label";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/atoms/sheet";
import { Input } from "@/components/atoms/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

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

export function EditShopSheet({
  open,
  onOpenChange,
  shop,
  onUpdate,
}: EditShopSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SHOP");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setEmail(shop.email);
      setRole(shop.role);
      setPassword("");
      setConfirmPassword("");
    }
  }, [shop]);

  if (!shop) return null;

  const handleSave = async () => {
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
      const body: Record<string, any> = {};
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

      const updated = await res.json();
      toast.success("Shop updated successfully!");
      onUpdate(updated);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName(shop.name);
    setEmail(shop.email);
    setRole(shop.role);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full flex flex-col bg-[#292929] border-black"
      >
        <SheetHeader>
          <SheetTitle className="text-xl text-[#f0f0f0]">
            Edit Shop Data
          </SheetTitle>
          <SheetDescription className="text-lg text-[#b7b7b7]">
            Modify this shop’s name, email, role, or password.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-md text-[#f0f0f0] ml-6">
              Name:
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-md text-[#f0f0f0] ml-6">
              Email:
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-md text-[#f0f0f0] ml-6">
              Role:
            </Label>
            <Select value={role} onValueChange={(val) => setRole(val)}>
              <SelectTrigger className="w-[90%] mx-auto justify-between bg-[#171717] border-0 text-[#f0f0f0] hover:bg-[#414141] hover:text-[#f0f0f0]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[#545454] text-[#f0f0f0]">
                <SelectItem value="SHOP">SHOP</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-md text-[#f0f0f0] ml-6">
              New Password:
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-md text-[#f0f0f0] ml-6">
              Confirm New Password:
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#414141]"
          >
            {loading ? "Saving..." : "Save Changes"}
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
