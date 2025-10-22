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

interface Shop {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ManageShopsPage() {
  const { user } = useUser();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [open, setOpen] = useState(false);
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
    setOpen(true);
  };

  const handleUpdateShop = async (updatedShop: Shop) => {
    setShops((prev) =>
      prev.map((s) => (s.id === updatedShop.id ? updatedShop : s))
    );
    await fetchShops();
  };

  return (
    <div className="flex flex-col">
      <Label className="text-3xl font-bold mb-1">Manage Shops</Label>
      <Label className="text-lg text-[var(--color-text-primary)] mb-6">
        View, edit, or create shop accounts below.
      </Label>

      <div className="flex flex-col gap-y-3">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="flex max-w-1/3 items-center justify-between bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border)]"
          >
            <div className="flex flex-col">
              <Label className="text-lg text-[var(--color-text-primary)]">{shop.name}</Label>
              <Label className="text-sm text-[var(--color-text-secondary)]">{shop.email}</Label>
              <Label className="text-sm text-[var(--color-text-thirdly)]">
                Role: {shop.role}
              </Label>
            </div>

            <div className="flex flex-row gap-x-4">
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
                  <Button className="transition text-[var(--color-text-primary)] delay-50 duration-200 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-caution)]">
                    Delete
                  </Button>
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row mt-6 gap-x-5">
        <Button
          onClick={() => setCreateOpen(true)}
          className="disabled:opacity-50 w-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[var(--color-bg-select-hover)]"
        >
          Create New Shop
        </Button>
      </div>

      <EditShopSheet
        open={open}
        onOpenChange={setOpen}
        shop={selectedShop}
        onUpdate={handleUpdateShop}
      />

      <CreateShopSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={fetchShops}
      />
    </div>
  );
}
