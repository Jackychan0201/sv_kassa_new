"use client";

import { Label } from "@/components/atoms/label";
import { useUser } from "@/components/providers/user-provider";
import { useEffect, useState } from "react";
import { getRecordByDate, getAllShops, getShopById } from "@/lib/api";
import { DailyRecord, Shop } from "@/lib/types";
import { CloseDaySheet } from "@/components/organisms/close-day-sheet";
import { EditDayDialog } from "@/components/molecules/edit-day-dialog";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { SetReminderDialog } from "@/components/molecules/set-reminder-dialog";
import { CloseDayDialog } from "@/components/molecules/close-day-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms/select";

export default function DashboardPage() {
  const today = new Date();
  const formattedDate = `${(today.getDate() < 10 ? "0" : "")}${today.getDate()}.${
    today.getMonth() + 1 < 10 ? "0" : ""
  }${today.getMonth() + 1}.${today.getFullYear()}`;

  const { user } = useUser();
  const [record, setRecord] = useState<DailyRecord[] | null>(null);
  const [allRecords, setAllRecords] = useState<DailyRecord[] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [notClosedShopNames, setNotClosedShopNames] = useState<string[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("ALL"); 

  const loadRecord = async () => {
    try {
      const data = await getRecordByDate(formattedDate);
      setRecord(data);

      if (user?.role === "CEO") {
        const todaysRecords = await getRecordByDate(formattedDate);
        setAllRecords(todaysRecords);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadShops = async () => {
    if (user?.role === "CEO") {
      try {
        const allShops = await getAllShops();
        setShops(allShops.filter((s) => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Failed to fetch shops:", err);
      }
    }
  };

  const resolveNotClosedShops = async () => {
    if (user?.role !== "CEO" || !allRecords || shops.length === 0) return;

    try {
      const closedShopIds = allRecords.map((r) => r.shopId);
      const notClosedShops = shops.filter((s) => !closedShopIds.includes(s.id));

      const names = await Promise.all(
        notClosedShops.map(async (shop) => {
          try {
            const shopData = await getShopById(shop.id);
            return shopData.name;
          } catch (err) {
            console.error(`Failed to fetch shop name for ${shop.id}:`, err);
            return shop.id;
          }
        })
      );

      setNotClosedShopNames(names);
    } catch (err) {
      console.error("Error resolving not closed shops:", err);
    }
  };

  useEffect(() => {
    loadShops();
    loadRecord();
  }, [user]);

  useEffect(() => {
    resolveNotClosedShops();
  }, [allRecords, shops]);

  if (!user) {
    return <LoadingFallback message="Loading user info..." />;
  }

  if (!record) {
    return <LoadingFallback message="Loading records..." />;
  }

  let filteredRecords: DailyRecord[] = [];
  if (user.role === "SHOP") {
    filteredRecords = record;
  } else if (user.role === "CEO") {
    if (selectedShopId === "ALL") {
      filteredRecords = allRecords ?? [];
    } else {
      filteredRecords = (allRecords ?? []).filter((r) => r.shopId === selectedShopId);
    }
  }

  let recordData: (number | null)[] = [];
  if (filteredRecords.length === 0) {
    recordData = [null, null, null, null, null, null];
  } else if (user.role === "SHOP") {
    const r = filteredRecords[0];
    recordData = [
      r.mainStockValue,
      r.orderStockValue,
      r.revenueMainWithoutMargin,
      r.revenueMainWithMargin,
      r.revenueOrderWithoutMargin,
      r.revenueOrderWithMargin,
    ];
  } else if (user.role === "CEO") {
    const sum = (key: keyof DailyRecord) =>
      filteredRecords.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
    recordData = [
      sum("mainStockValue"),
      sum("orderStockValue"),
      sum("revenueMainWithoutMargin"),
      sum("revenueMainWithMargin"),
      sum("revenueOrderWithoutMargin"),
      sum("revenueOrderWithMargin"),
    ];
  }

  let dayStatusLabel = "";
  let dayStatusColor = "";

  if (user.role === "SHOP") {
    dayStatusLabel =
      recordData[0] !== null
        ? "Day is closed successfully!"
        : "Day is not closed!";
    dayStatusColor = recordData[0] !== null ? "#009908" : "#960000";
  } else if (user.role === "CEO") {
    if (!allRecords) {
      dayStatusLabel = "Loading daily records...";
      dayStatusColor = "#666666";
    } else if (notClosedShopNames.length === 0) {
      dayStatusLabel = "All shops closed their days";
      dayStatusColor = "#009908";
    } else {
      dayStatusLabel = `Not all shops closed their days: ${notClosedShopNames.join(", ")}`;
      dayStatusColor = "#960000";
    }
  }

  const closeDayDisabled =
    user.role === "SHOP"
      ? recordData[0] !== null
      : notClosedShopNames.length === 0;

  return (
    <div>
      <div className="flex flex-col">
        <Label className="text-3xl font-bold">Dashboard</Label>
        <Label className="text-lg">Today is: {formattedDate}</Label>
      </div>

      {/* --- Shop selector for CEO --- */}
      {user.role === "CEO" && (
        <div className="mt-6">
          <Label className="mb-1 text-lg">Select Shop</Label>
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-48 bg-[#171717] border-0 text-[#f0f0f0] hover:bg-[#414141] hover:text-[#f0f0f0]">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent className="bg-[#545454] text-[#f0f0f0]">
              <SelectItem value="ALL">ALL</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* --- Daily records --- */}
      <div className="flex flex-col mt-10 gap-y-7">
        <Label className="text-xl">
          Main stock value ({formattedDate}):{" "}
          {recordData[0] !== null ? recordData[0].toFixed(2) : "-"}
        </Label>
        <Label className="text-xl">
          Order stock value ({formattedDate}):{" "}
          {recordData[1] !== null ? recordData[1].toFixed(2) : "-"}
        </Label>
        <Label className="text-xl">
          Revenue main stock (no margin) ({formattedDate}):{" "}
          {recordData[2] !== null ? recordData[2].toFixed(2) : "-"}
        </Label>
        <Label className="text-xl">
          Revenue main stock (with margin) ({formattedDate}):{" "}
          {recordData[3] !== null ? recordData[3].toFixed(2) : "-"}
        </Label>
        <Label className="text-xl">
          Revenue order stock (no margin) ({formattedDate}):{" "}
          {recordData[4] !== null ? recordData[4].toFixed(2) : "-"}
        </Label>
        <Label className="text-xl">
          Revenue order stock (with margin) ({formattedDate}):{" "}
          {recordData[5] !== null ? recordData[5].toFixed(2) : "-"}
        </Label>

        <Label className="text-xl" style={{ color: dayStatusColor }}>
          {dayStatusLabel}
        </Label>
      </div>

      {/* --- Actions --- */}
      <div className="flex flex-row mt-10 gap-x-5">
        {user.role === "SHOP" ? (
          <CloseDaySheet
            disabled={closeDayDisabled}
            formattedDate={formattedDate}
            onSaved={loadRecord}
          />
        ) : (
          <CloseDayDialog
            shops={shops.filter((s) => notClosedShopNames.includes(s.name))}
            disabled={closeDayDisabled}
            onClosed={loadRecord}
            formattedDate={formattedDate}
          />
        )}
        <EditDayDialog onSaved={loadRecord} />
        <SetReminderDialog />
      </div>
    </div>
  );
}
