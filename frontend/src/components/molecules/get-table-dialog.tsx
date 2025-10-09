"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { DatePicker } from "./date-picker";
import { toast } from "sonner";
import { getRecordsByRange, getAllShops } from "@/lib/api";
import { DailyRecord, Shop } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { useUser } from "@/components/providers/user-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

export function GetTableDialog() {
  const { user } = useUser();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DailyRecord[] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("ALL");

  useEffect(() => {
    const fetchShops = async () => {
      if (user?.role === "CEO") {
        try {
          const allShops = await getAllShops();
          setShops(allShops.filter((s) => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
          console.error("Failed to fetch shops:", err);
        }
      }
    };
    fetchShops();
  }, [user]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setRecords(null);
      setFromDate(null);
      setToDate(null);
      setSelectedShop("ALL");
    }
  };

  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getFullYear()}`;

  const handleFetch = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From and To dates");
      return;
    }

    setLoading(true);

    try {
      const data = await getRecordsByRange(formatDate(fromDate), formatDate(toDate));

      let filtered = data;
      if (user?.role === "CEO" && selectedShop !== "ALL") {
        filtered = data.filter((r) => r.shopId === selectedShop);
      }

      setRecords(filtered);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button className="disabled:opacity-50 w-50 transition text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[#414141]">
            Show table
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[1000px] border-black bg-[#292929] text-[#f0f0f0]">
          <DialogHeader>
            <DialogTitle>Daily Records Table</DialogTitle>
            <DialogDescription className="text-[#f0f0f0]">
              Select a date range to view multiple records
            </DialogDescription>
          </DialogHeader>

          {/* CEO-only shop selector */}
          {user?.role === "CEO" && (
            <div className="mt-4">
              <p className="text-sm mb-1 text-[#f0f0f0]">Select shop</p>
              <Select
                value={selectedShop}
                onValueChange={(val) => setSelectedShop(val)}
              >
                <SelectTrigger className="w-48 justify-between bg-[#171717] border-0 text-[#f0f0f0] hover:bg-[#414141] hover:text-[#f0f0f0]">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent className="bg-[#545454] text-[#f0f0f0]">
                  <SelectItem value="ALL">All</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date pickers */}
          <div className="flex gap-4 mt-4">
            <DatePicker title="From date" value={fromDate} onChange={setFromDate} />
            <DatePicker title="To date" value={toDate} onChange={setToDate} />
          </div>

          {/* Table section */}
          <div className="mt-4">
            {loading && <p>Loading...</p>}
            {!loading && records && records.length > 0 && (
              <ScrollArea className="h-[30vh] w-full rounded-lg border border-[#3f3e3e]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#f0f0f0]">Record date</TableHead>
                      {user?.role === "CEO" && (
                        <TableHead className="text-[#f0f0f0]">Shop</TableHead>
                      )}
                      <TableHead className="text-[#f0f0f0]">Main stock value</TableHead>
                      <TableHead className="text-[#f0f0f0]">Order stock value</TableHead>
                      <TableHead className="text-[#f0f0f0]">
                        Revenue main stock (with margin)
                      </TableHead>
                      <TableHead className="text-[#f0f0f0]">
                        Revenue main stock (without margin)
                      </TableHead>
                      <TableHead className="text-[#f0f0f0]">
                        Revenue order stock (with margin)
                      </TableHead>
                      <TableHead className="text-[#f0f0f0]">
                        Revenue order stock (without margin)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.recordDate}</TableCell>
                        {user?.role === "CEO" && (
                          <TableCell>
                            {shops.find((s) => s.id === r.shopId)?.name || r.shopId}
                          </TableCell>
                        )}
                        <TableCell>{r.mainStockValue.toFixed(2)}</TableCell>
                        <TableCell>{r.orderStockValue.toFixed(2)}</TableCell>
                        <TableCell>{r.revenueMainWithMargin.toFixed(2)}</TableCell>
                        <TableCell>{r.revenueMainWithoutMargin.toFixed(2)}</TableCell>
                        <TableCell>{r.revenueOrderWithMargin.toFixed(2)}</TableCell>
                        <TableCell>{r.revenueOrderWithoutMargin.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
            {!loading && records && records.length === 0 && (
              <p className="text-[#b7b7b7] mt-4">No records found in this range.</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button className="w-30 transition text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#363636]">
                Close
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleFetch}
              className="w-20 transition bg-[#595959] text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-105 hover:bg-[#646464]"
            >
              Go
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
