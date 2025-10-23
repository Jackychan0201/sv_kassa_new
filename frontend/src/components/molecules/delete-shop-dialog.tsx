"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/atoms/dialog";
import { deleteShop } from "@/lib/api";
import { Shop } from "@/lib/types";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DeleteShopDialogProps {
  shop: Shop | null;
  trigger: React.ReactNode;
  onDeleted?: () => void;
}

export function DeleteShopDialog({ shop, trigger, onDeleted }: DeleteShopDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!shop) return;
    setLoading(true);
    try {
      await deleteShop(shop.id);
      toast.success(`${shop.name} deleted successfully`);
      onDeleted?.();
      setOpen(false);
    } catch (err: unknown) {
      handleError(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shop) setOpen(false);
  }, [shop]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-[400px] border-black bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
        <DialogHeader>
          <DialogTitle>Delete Shop</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {shop?.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button className="disabled:opacity-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[var(--color-bg-select-hover)]">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 w-20 transition text-[var(--color-text-primary)] delay-150 duration-300 hover:-translate-y-0 hover:scale-105 ease-in-out"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
