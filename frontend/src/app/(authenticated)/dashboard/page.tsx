"use client";

import { Label } from "@/components/atoms/label";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { CloseDaySheet } from "@/components/organisms/close-day-sheet";
import { EditDayDialog } from "@/components/molecules/edit-day-dialog";
import { SetReminderDialog } from "@/components/molecules/set-reminder-dialog";
import { CloseDayDialog } from "@/components/molecules/close-day-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms/select";
import { useUser } from "@/components/providers/user-provider";
import { DashboardProvider, useDashboard } from "@/components/providers/dashboard-page-context";
import { ErrorBoundary } from "@/components/molecules/error-boundary";

function DashboardContent() {
  const { user } = useUser();
  const {
    record,
    allRecords,
    shops,
    notClosedShopNames,
    selectedShopId,
    setSelectedShopId,
    reloadData,
  } = useDashboard();

  const formattedDate = new Intl.DateTimeFormat("de-DE").format(new Date());

  if (!user) return <LoadingFallback message="Loading user info..." />;
  if (!record) return <LoadingFallback message="Loading records..." />;

  const filteredRecords =
    user.role === "SHOP"
      ? record
      : selectedShopId === "ALL"
      ? allRecords ?? []
      : (allRecords ?? []).filter((r) => r.shopId === selectedShopId);

  const recordData: (number | null)[] =
    filteredRecords.length === 0
      ? [null, null, null, null, null, null]
      : user.role === "SHOP"
      ? [
          filteredRecords[0].mainStockValue,
          filteredRecords[0].orderStockValue,
          filteredRecords[0].revenueMainWithoutMargin,
          filteredRecords[0].revenueMainWithMargin,
          filteredRecords[0].revenueOrderWithoutMargin,
          filteredRecords[0].revenueOrderWithMargin,
        ]
      : [
          "mainStockValue",
          "orderStockValue",
          "revenueMainWithoutMargin",
          "revenueMainWithMargin",
          "revenueOrderWithoutMargin",
          "revenueOrderWithMargin",
        ].map((key) =>
          filteredRecords.reduce((acc, r) => acc + (Number(r[key as keyof typeof r]) || 0), 0)
        );

  let dayStatusLabel = "";
  let dayStatusColor = "";
  if (user.role === "SHOP") {
    dayStatusLabel = recordData[0] !== null ? "Day is closed successfully!" : "Day is not closed!";
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

  const closeDayDisabled = user.role === "SHOP" ? recordData[0] !== null : notClosedShopNames.length === 0;

  return (
    <div>
      <div className="flex flex-col">
        <Label className="text-3xl font-bold">Dashboard</Label>
        <Label className="text-lg">Today is: {formattedDate}</Label>
      </div>

      {user.role === "CEO" && (
        <div className="mt-6">
          <Label className="mb-1 text-lg">Select Shop</Label>
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-48 bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)]">
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

      <div className="flex flex-col mt-10 gap-y-7">
        {[
          "Main stock value",
          "Order stock value",
          "Revenue main stock (no margin)",
          "Revenue main stock (with margin)",
          "Revenue order stock (no margin)",
          "Revenue order stock (with margin)",
        ].map((label, index) => (
          <Label key={index} className="text-xl">
            {label} ({formattedDate}): {recordData[index] !== null ? recordData[index]!.toFixed(2) : "-"}
          </Label>
        ))}

        <Label className="text-xl" style={{ color: dayStatusColor }}>
          {dayStatusLabel}
        </Label>
      </div>

      <div className="flex flex-row mt-10 gap-x-5">
        {user.role === "SHOP" ? (
          <CloseDaySheet disabled={closeDayDisabled} formattedDate={formattedDate} onSaved={reloadData} />
        ) : (
          <CloseDayDialog
            shops={shops.filter((s) => notClosedShopNames.includes(s.name))}
            disabled={closeDayDisabled}
            onClosed={reloadData}
            formattedDate={formattedDate}
          />
        )}
        <EditDayDialog onSaved={reloadData} />
        <SetReminderDialog />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ErrorBoundary>
  );
}
