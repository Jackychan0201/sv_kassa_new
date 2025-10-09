"use client";

import { useState } from "react";
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
import { createShop } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

interface CreateShopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}

export function CreateShopSheet({ open, onOpenChange, onCreate }: CreateShopSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SHOP");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await createShop({ name, email, password, role });
      toast.success("Shop created successfully!");
      onCreate();
      onOpenChange(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="h-full flex flex-col bg-[#292929] border-black">
        <SheetHeader>
          <SheetTitle className="text-xl text-[#f0f0f0]">Create New Shop</SheetTitle>
          <SheetDescription className="text-lg text-[#b7b7b7]">
            Add a new shop account to your system.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-md text-[#f0f0f0] ml-6">Name:</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-md text-[#f0f0f0] ml-6">Email:</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-md text-[#f0f0f0] ml-6">Role:</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[90%] mx-auto justify-between bg-[#171717] border-0 text-[#f0f0f0] hover:bg-[#414141]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[#545454] text-[#f0f0f0]">
                <SelectItem value="SHOP">SHOP</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password" className="text-md text-[#f0f0f0] ml-6">Password:</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[90%] mx-auto border-[#3f3e3e] text-[#f0f0f0]"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-md text-[#f0f0f0] ml-6">
              Confirm Password:
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
            className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:scale-105 hover:bg-[#414141]"
          >
            {loading ? "Creating..." : "Create Shop"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
