"use client";

import { useEffect, useState, useCallback } from "react";
import { Label } from "@/components/atoms/label";
import { Button } from "@/components/atoms/button";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { useUser } from "@/components/providers/user-provider";
import { EditShopSheet } from "@/components/organisms/edit-shop-sheet";
import { CreateShopSheet } from "@/components/organisms/create-shop-sheet";
import { DeleteShopDialog } from "@/components/molecules/delete-shop-dialog";
import { handleError } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarTrigger } from "@/components/atoms/sidebar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/molecules/card";

interface Shop {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ManageShopsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchShops = useCallback(async () => {
    if (!user || user.role !== "CEO") return;

    try {
      setLoading(true);
      const res = await fetch("/api/shops", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch shops");

      const data: Shop[] = await res.json();
      const filtered = data
        .filter((shop) => shop.id !== user.shopId)
        .sort((a, b) => a.name.localeCompare(b.name));
      setShops(filtered);
    } catch (err) {
      handleError(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  if (!user) return <LoadingFallback message="Loading user..." />;
  if (loading) return <LoadingFallback message="Loading shops..." />;

  const handleEditClick = (shop: Shop) => {
    setSelectedShop(shop);
    setEditOpen(true);
  };

  const handleUpdateShop = async (updatedShop: Shop) => {
    setShops((prev) =>
      prev.map((s) => (s.id === updatedShop.id ? updatedShop : s))
    );
    await fetchShops();
  };

  return (
    <SidebarInset className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 bg-[var(--color-bg-secondary)]">
        <SidebarTrigger className="-ml-1 text-[var(--color-text-primary)]" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Manage Shops</h1>
          <p className="text-xs text-[var(--color-text-thirdly)]">
            View, edit, or create shop accounts
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* SHOPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card
              key={shop.id}
              className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            >
              <CardHeader>
                <CardTitle className="text-lg text-[var(--color-text-primary)]">
                  {shop.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-[var(--color-text-secondary)]">Email: {shop.email}</div>
                <div className="text-sm text-[var(--color-text-thirdly)]">Role: {shop.role}</div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => handleEditClick(shop)}
                    className="text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] transition ease-in-out hover:scale-105"
                  >
                    Edit
                  </Button>
                  <DeleteShopDialog
                    shop={shop}
                    onDeleted={fetchShops}
                    trigger={
                      <Button className="transition text-[var(--color-text-primary)] hover:bg-[var(--color-caution)] hover:scale-105">
                        Delete
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* CREATE SHOP BUTTON */}
        <div className="flex justify-start">
          <Button
            onClick={() => setCreateOpen(true)}
            className="transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover-type2)]"
          >
            Create New Shop
          </Button>
        </div>
      </div>

      <EditShopSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        shop={selectedShop}
        onUpdate={handleUpdateShop}
      />

      <CreateShopSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={fetchShops}
      />
    </SidebarInset>
  );
}
