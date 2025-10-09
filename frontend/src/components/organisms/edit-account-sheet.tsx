"use client";

import { useState } from "react";
import { Label } from "@/components/atoms/label";
import { Button } from "@/components/atoms/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/atoms/sheet";
import { Input } from "@/components/atoms/input";
import { toast } from "sonner";
import { useUser } from "@/components/providers/user-provider";

interface EditAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountSheet({ open, onOpenChange }: EditAccountSheetProps) {
  const { user, setUser } = useUser();

  if (!user) return null;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setConfirmPassword("");
    }
  };

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
      if (name !== user.name) body.name = name;
      if (email !== user.email) body.email = email;
      if (password.trim() !== "") body.password = password;

      const res = await fetch(`/api/shops/${user.shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update account");
      }

      const updated = await res.json();

      setUser({ ...user, ...updated });

      toast.success("Account updated successfully!");
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save account changes");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="h-full flex flex-col bg-[#292929] border-black">
        <SheetHeader>
          <SheetTitle className="text-xl text-[#f0f0f0]">Edit Account Data</SheetTitle>
          <SheetDescription className="text-lg text-[#b7b7b7]">
            Update your personal and login information
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
              placeholder="Enter your name"
              autoComplete="off"
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
              placeholder="Enter your email"
              autoComplete="off"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-md text-[#f0f0f0] ml-6">
              New password:
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-md text-[#f0f0f0] ml-6">
              Confirm new password:
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="mt-auto mb-4 flex flex-col w-[90%] mx-auto gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#414141]"
          >
            {loading ? "Saving..." : "Save changes"}
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
