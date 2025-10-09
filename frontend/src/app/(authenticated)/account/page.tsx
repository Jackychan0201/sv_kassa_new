"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/atoms/label";
import { Button } from "@/components/atoms/button";
import { useUser } from "@/components/providers/user-provider";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { logout } from "@/lib/api";
import { EditAccountSheet } from "@/components/organisms/edit-account-sheet";

export default function AccountPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) return <LoadingFallback message="Loading..." />;

  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <div className="flex flex-col">
      <Label className="text-4xl font-bold">Account</Label>
      <Label className="text-lg mb-8">Manage your profile and preferences here.</Label>

      <div className="flex flex-col gap-y-4">
        <Label className="text-xl">Name: {user!.name}</Label>
        <Label className="text-xl">Email: {user!.email}</Label>
      </div>

      <div className="flex flex-row mt-10 gap-x-5">
        <Button
          onClick={() => setOpen(true)}
          className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#414141]"
        >
          Change Account Data
        </Button>

        <Button
          onClick={handleLogout}
          className="transition text-[#f0f0f0] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#ff4d4d]"
        >
          Logout
        </Button>
      </div>

      <EditAccountSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
