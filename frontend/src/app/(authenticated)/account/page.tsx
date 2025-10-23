"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/user-provider";
import { SidebarInset, SidebarTrigger } from "@/components/atoms/sidebar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/molecules/card";
import { Button } from "@/components/atoms/button";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { EditAccountSheet } from "@/components/organisms/edit-account-sheet";
import { logout } from "@/lib/api";
import { handleError } from "@/lib/utils";

export default function AccountPage() {
  const { user } = useUser();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return <LoadingFallback message="Loading..." />;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err: unknown) {
      handleError(err);
      router.push("/login");
    }
  };

  return (
    <SidebarInset className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 bg-[var(--color-bg-secondary)]">
        <SidebarTrigger className="-ml-1 text-[var(--color-text-primary)]" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Account</h1>
          <p className="text-xs text-[var(--color-text-thirdly)]">
            Manage your profile and preferences
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* ACCOUNT INFO CARD */}
        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-[var(--color-text-primary)]">Name: {user.name}</div>
            <div className="text-sm text-[var(--color-text-primary)]">Email: {user.email}</div>
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={() => setEditOpen(true)}
            className="transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]"
          >
            Change Account Data
          </Button>

          <Button
            onClick={handleLogout}
            className="transition bg-[var(--color-caution)] text-[var(--color-text-primary)] hover:bg-[var(--color-caution-hover)]"
          >
            Logout
          </Button>
        </div>
      </div>

      <EditAccountSheet open={editOpen} onOpenChange={setEditOpen} />
    </SidebarInset>
  );
}
