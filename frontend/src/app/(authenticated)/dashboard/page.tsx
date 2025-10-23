"use client"
import { SidebarInset, SidebarTrigger } from "@/components/atoms/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card"
import { LoadingFallback } from "@/components/molecules/loading-fallback"
import { CloseDaySheet } from "@/components/organisms/close-day-sheet"
import { EditDaySheet } from "@/components/organisms/edit-day-sheet"
import { SetReminderDialog } from "@/components/molecules/set-reminder-dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms/select"
import { useUser } from "@/components/providers/user-provider"
import { DashboardProvider, useDashboard } from "@/components/providers/dashboard-page-context"
import { ErrorBoundary } from "@/components/molecules/error-boundary"
import { TrendingUp, Package, DollarSign, AlertCircle } from "lucide-react"
import { Label } from "@/components/atoms/label"
import type { DailyRecord } from "@/lib/types"

function DashboardContent() {
  const { user } = useUser()
  const { record, allRecords, shops, notClosedShopNames, selectedShopId, setSelectedShopId, reloadData } =
    useDashboard()

  const formattedDate = new Intl.DateTimeFormat("de-DE").format(new Date())

  if (!user) return <LoadingFallback message="Loading user info..." />

  // Fix endless loading for SHOP
  if (user.role === "SHOP" && record === null) return <LoadingFallback message="Loading records..." />

  const filteredRecords: DailyRecord[] =
    user.role === "SHOP"
      ? record || []
      : selectedShopId === "ALL"
        ? (allRecords ?? [])
        : (allRecords ?? []).filter((r) => r.shopId === selectedShopId)

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
          ].map((key) => filteredRecords.reduce((acc, r) => acc + (Number(r[key as keyof DailyRecord]) || 0), 0))

  let dayStatusLabel = ""
  let dayStatusColor = ""

  if (user.role === "SHOP") {
    const isClosed = recordData[0] !== null
    dayStatusLabel = isClosed ? "Day is closed successfully!" : "Day is not closed!"
    dayStatusColor = isClosed ? "text-[#009908]" : "text-[#960000]"
  } else if (user.role === "CEO") {
    if (!allRecords) {
      dayStatusLabel = "Loading daily records..."
      dayStatusColor = "text-[var(--color-text-thirdly)]"
    } else if (notClosedShopNames.length === 0) {
      dayStatusLabel = "All shops closed their days"
      dayStatusColor = "text-[#009908]"
    } else {
      dayStatusLabel = `Not all shops closed their days: ${notClosedShopNames.join(", ")}`
      dayStatusColor = "text-[#960000]"
    }
  }

  const closeDayDisabled = user.role === "SHOP" ? recordData[0] !== null : notClosedShopNames.length === 0

  const metrics = [
    { label: "Main Stock Value", value: recordData[0], icon: Package },
    { label: "Order Stock Value", value: recordData[1], icon: Package },
    { label: "Revenue Main (No Margin)", value: recordData[2], icon: DollarSign },
    { label: "Revenue Main (With Margin)", value: recordData[3], icon: TrendingUp },
    { label: "Revenue Order (No Margin)", value: recordData[4], icon: DollarSign },
    { label: "Revenue Order (With Margin)", value: recordData[5], icon: TrendingUp },
  ]

  return (
    <SidebarInset className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 bg-[var(--color-bg-secondary)]">
        <SidebarTrigger className="-ml-1 text-[var(--color-text-primary)]" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-xs text-[var(--color-text-thirdly)]">Today is: {formattedDate}</p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* CEO Shop Selector */}
        {user.role === "CEO" && (
          <div>
            <Label className="mb-1 text-lg text-[var(--color-text-primary)]">Select Shop</Label>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-48 bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                <SelectValue placeholder="Select shop" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
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

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card
                key={index}
                className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  <Icon className="h-4 w-4 text-[var(--color-text-thirdly)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value !== null ? `${metric.value.toFixed(2)}` : "N/A"}
                  </div>
                  <p className="text-xs text-[var(--color-text-thirdly)] mt-1">{formattedDate}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* DAY STATUS CARD */}
        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <AlertCircle className={`h-5 w-5 ${dayStatusColor}`} />
            <CardTitle className={`text-base ${dayStatusColor}`}>{dayStatusLabel}</CardTitle>
          </CardHeader>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3">
          {/* Integrated CloseDaySheet for both CEO and SHOP */}
          <CloseDaySheet
            formattedDate={formattedDate}
            onSaved={reloadData}
            disabled={closeDayDisabled}
          />
          <EditDaySheet onSaved={reloadData} />
          <SetReminderDialog />
        </div>
      </div>
    </SidebarInset>
  )
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ErrorBoundary>
  )
}
