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
import { useUser } from "@/components/providers/user-provider";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/molecules/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

const chartOptions = [
  { key: "mainStockValue", label: "Main stock value" },
  { key: "orderStockValue", label: "Order stock value" },
  { key: "revenueMainWithMargin", label: "Revenue main stock (with margin)" },
  { key: "revenueMainWithoutMargin", label: "Revenue main stock (without margin)" },
  { key: "revenueOrderWithMargin", label: "Revenue order stock (with margin)" },
  { key: "revenueOrderWithoutMargin", label: "Revenue order stock (without margin)" },
];

const lineColors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#00c49f",
  "#ff69b4",
  "#0088fe",
  "#a020f0",
  "#ffa500",
  "#4caf50",
];

export function GetChartDialog() {
  const { user } = useUser();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DailyRecord[] | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      if (user?.role === "CEO") {
        try {
          const data = await getAllShops();
          const filtered = data.filter((s) => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name));
          setShops(filtered);
          setSelectedShops(filtered.map((s) => s.id));
          setSelectAll(true);
        } catch (err) {
          console.error("Failed to load shops", err);
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
      setSelectedMetric(null);
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
    if (!selectedMetric) {
      toast.error("Please select a chart metric");
      return;
    }

    setLoading(true);
    try {
      const data = await getRecordsByRange(formatDate(fromDate), formatDate(toDate));
      setRecords(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!checked && selectedShops.length === 1) {
      toast.error("At least one shop must be selected");
      return;
    }

    setSelectAll(checked);
    if (checked) setSelectedShops(shops.map((s) => s.id));
    else setSelectedShops([]);
  };

  const toggleShop = (id: string, checked: boolean) => {
    if (!checked && selectedShops.length === 1) {
      toast.error("At least one shop must be selected");
      return;
    }

    if (checked) setSelectedShops((prev) => [...prev, id]);
    else {
      setSelectedShops((prev) => prev.filter((s) => s !== id));
      setSelectAll(false);
    }
  };

  const selectedOption = chartOptions.find((opt) => opt.key === selectedMetric);

  let mergedData: any[] = [];

  if (records && selectedMetric) {
    if (user?.role === "CEO") {
      mergedData = Object.values(
        records.reduce((acc, rec) => {
          if (!acc[rec.recordDate]) acc[rec.recordDate] = { recordDate: rec.recordDate };
          acc[rec.recordDate][rec.shopId] =
            rec[selectedMetric as keyof DailyRecord] ?? 0;
          return acc;
        }, {} as Record<string, Record<string, any>>)
      );
    } else {
      mergedData = records.map((rec) => ({
        recordDate: rec.recordDate,
        [selectedMetric]: rec[selectedMetric as keyof DailyRecord] ?? 0,
      }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button className="disabled:opacity-50 w-50 transition text-[#f0f0f0] delay-150 duration-300 ease-in-out hover:-translate-y-0 hover:scale-110 hover:bg-[#414141]">
            Show chart
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[70vw] max-h-[90vh] overflow-y-auto border-black bg-[#292929] text-[#f0f0f0]">
          <DialogHeader>
            <DialogTitle>Daily Records Chart</DialogTitle>
            <DialogDescription className="text-[#f0f0f0]">
              Select a date range and a metric to display chart
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 mt-2 flex-wrap">
            <DatePicker title="From date" value={fromDate} onChange={setFromDate} />
            <DatePicker title="To date" value={toDate} onChange={setToDate} />
            <div>
              <p className="text-sm mb-1">Select metric</p>
              <Select
                value={selectedMetric ?? undefined}
                onValueChange={(val) => setSelectedMetric(val)}
              >
                <SelectTrigger className="w-48 justify-between bg-[#171717] border-0 text-[#f0f0f0] hover:bg-[#414141] hover:text-[#f0f0f0]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent className="bg-[#545454] text-[#f0f0f0]">
                  {chartOptions.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {user?.role === "CEO" && shops.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2">Select shops</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                  <span>All Shops</span>
                </label>
                {shops.map((shop, idx) => (
                  <label key={shop.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedShops.includes(shop.id)}
                      onCheckedChange={(checked) => toggleShop(shop.id, !!checked)}
                    />
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: lineColors[idx % lineColors.length],
                        }}
                      ></span>
                      {shop.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            {loading && <p>Loading...</p>}
            {!loading && records && records.length > 0 && selectedMetric && (
              <div className="max-w-[100vw]">
                <ChartContainer
                  className="h-[40vh] w-full"
                  config={{
                    [selectedMetric]: {
                      label: selectedOption?.label || "Value",
                      color: "#8884d8",
                    },
                  }}
                >
                  <div className="h-[35vh]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mergedData} margin={{ bottom: 20, right: 10, top: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="recordDate"
                          interval={0}
                          tick={{ fontSize: 12 }}
                          angle={-30}
                          textAnchor="end"
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent hideIndicator={true} />} />

                        {user?.role === "CEO" &&
                          shops.map(
                            (shop, idx) =>
                              selectedShops.includes(shop.id) && (
                                <Line
                                  key={shop.id}
                                  type="monotone"
                                  dataKey={shop.id}
                                  name={shop.name}
                                  stroke={lineColors[idx % lineColors.length]}
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                              )
                          )}

                        {user?.role === "SHOP" && (
                          <Line
                            type="monotone"
                            dataKey={selectedMetric}
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>

                    {user?.role === "CEO" && (
                      <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {shops
                          .filter((shop) => selectedShops.includes(shop.id))
                          .map((shop, idx) => (
                            <div
                              key={shop.id}
                              className="flex items-center gap-2 text-sm text-[#f0f0f0]"
                            >
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: lineColors[idx % lineColors.length],
                                }}
                              ></span>
                              <span>{shop.name}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </ChartContainer>

              </div>
            )}
            {!loading && records && records.length === 0 && (
              <p className="text-[#b7b7b7] mt-4">
                No records found in this range.
              </p>
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
