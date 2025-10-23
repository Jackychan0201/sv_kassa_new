"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/atoms/label"
import { LoadingFallback } from "@/components/molecules/loading-fallback"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card"
import type { DailyRecord, Shop } from "@/lib/types"
import { getRecordsByRange, getAllShops } from "@/lib/api"
import { useUser } from "@/components/providers/user-provider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms/select"
import { handleError } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { TrendingUp, Package, AlertCircle, Activity, Target, Percent, TableIcon, BarChart3 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/atoms/sidebar"
import { DatePicker } from "@/components/molecules/date-picker"
import { Button } from "@/components/atoms/button"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table"
import { ScrollArea } from "@/components/atoms/scroll-area"
import { Checkbox } from "@/components/atoms/checkbox"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/molecules/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const chartOptions = [
  { key: "mainStockValue", label: "Main stock value" },
  { key: "orderStockValue", label: "Order stock value" },
  { key: "revenueMainWithMargin", label: "Revenue main stock (with margin)" },
  { key: "revenueMainWithoutMargin", label: "Revenue main stock (without margin)" },
  { key: "revenueOrderWithMargin", label: "Revenue order stock (with margin)" },
  { key: "revenueOrderWithoutMargin", label: "Revenue order stock (without margin)" },
] as const

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
]

interface MergedRecord {
  recordDate: string
  [shopId: string]: string | number
}

export default function StatisticsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[] | null>(null)
  const [allRecords, setAllRecords] = useState<DailyRecord[] | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedShopId, setSelectedShopId] = useState<string>("ALL")

  const [tableFromDate, setTableFromDate] = useState<Date | null>(null)
  const [tableToDate, setTableToDate] = useState<Date | null>(null)
  const [tableLoading, setTableLoading] = useState(false)
  const [tableRecords, setTableRecords] = useState<DailyRecord[] | null>(null)
  const [tableSelectedShop, setTableSelectedShop] = useState<string>("ALL")

  const [chartFromDate, setChartFromDate] = useState<Date | null>(null)
  const [chartToDate, setChartToDate] = useState<Date | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartRecords, setChartRecords] = useState<DailyRecord[] | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<(typeof chartOptions)[number]["key"] | null>(null)
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  useEffect(() => {
    async function loadRecords() {
      try {
        const toDate = new Date()
        const fromDate = new Date()
        fromDate.setDate(toDate.getDate() - 29)

        const fromDateStr = formatDate(fromDate)
        const toDateStr = formatDate(toDate)

        if (!user) return

        if (user.role === "SHOP") {
          const records = await getRecordsByRange(fromDateStr, toDateStr)
          setDailyRecords(records)
        } else if (user.role === "CEO") {
          const allShops = await getAllShops()
          const filteredShops = allShops.filter((s) => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name))
          setShops(filteredShops)
          setSelectedShops(filteredShops.map((s) => s.id))
          setSelectAll(true)

          const records = await getRecordsByRange(fromDateStr, toDateStr)
          setAllRecords(records)
        }
      } catch (err) {
        handleError(err)
        router.push("/login")
      }
    }
    loadRecords()
  }, [user])

  const handleTableFetch = async () => {
    if (!tableFromDate || !tableToDate) {
      toast.error("Please select both From and To dates")
      return
    }

    setTableLoading(true)

    try {
      const data = await getRecordsByRange(formatDate(tableFromDate), formatDate(tableToDate))

      let filtered = data
      if (user?.role === "CEO" && tableSelectedShop !== "ALL") {
        filtered = data.filter((r) => r.shopId === tableSelectedShop)
      }

      setTableRecords(filtered)
    } catch (err) {
      handleError(err, "Failed to fetch records")
      router.push("/login")
    } finally {
      setTableLoading(false)
    }
  }

  const handleChartFetch = async () => {
    if (!chartFromDate || !chartToDate) {
      toast.error("Please select both From and To dates")
      return
    }
    if (!selectedMetric) {
      toast.error("Please select a chart metric")
      return
    }

    setChartLoading(true)
    try {
      const data = await getRecordsByRange(formatDate(chartFromDate), formatDate(chartToDate))
      setChartRecords(data)
    } catch (err) {
      handleError(err, "Failed to get data")
      router.push("/login")
    } finally {
      setChartLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!checked && selectedShops.length === 1) {
      toast.error("At least one shop must be selected")
      return
    }

    setSelectAll(checked)
    if (checked) setSelectedShops(shops.map((s) => s.id))
    else setSelectedShops([])
  }

  const toggleShop = (id: string, checked: boolean) => {
    if (!checked && selectedShops.length === 1) {
      toast.error("At least one shop must be selected")
      return
    }

    if (checked) setSelectedShops((prev) => [...prev, id])
    else {
      setSelectedShops((prev) => prev.filter((s) => s !== id))
      setSelectAll(false)
    }
  }

  if (!user) return <LoadingFallback message="Loading user info..." />
  if (error) return <Label className="text-red-500">Error: {error}</Label>
  if (!dailyRecords && user.role === "SHOP") return <LoadingFallback message="Loading records..." />
  if (!allRecords && user.role === "CEO") return <LoadingFallback message="Loading records for all shops..." />

  let recordsToUse: DailyRecord[] = []
  if (user.role === "SHOP") {
    recordsToUse = dailyRecords!
  } else if (user.role === "CEO") {
    if (selectedShopId === "ALL") {
      recordsToUse = allRecords ?? []
    } else {
      recordsToUse = (allRecords ?? []).filter((r) => r.shopId === selectedShopId)
    }
  }

  if (recordsToUse.length === 0) {
    return <Label>No records found in the selected date range.</Label>
  }

  const calculateGMROI = (records: DailyRecord[]) => {
    const validRecords = records.filter((r) => r.mainStockValue + r.orderStockValue > 0)
    if (!validRecords.length) return 0

    const avgStockValue =
      validRecords.reduce((acc, r) => acc + r.mainStockValue + r.orderStockValue, 0) / validRecords.length

    const totalRevenueWithMargin = validRecords.reduce(
      (acc, r) => acc + r.revenueMainWithMargin + r.revenueOrderWithMargin,
      0,
    )
    const totalRevenueWithoutMargin = validRecords.reduce(
      (acc, r) => acc + r.revenueMainWithoutMargin + r.revenueOrderWithoutMargin,
      0,
    )

    return avgStockValue ? (totalRevenueWithMargin - totalRevenueWithoutMargin) / avgStockValue : 0
  }

  const calculateDailyRevenueGrowth = (records: DailyRecord[], window = 7) => {
    if (records.length < 2) return 0

    const growthRates: number[] = []
    for (let i = window; i < records.length; i++) {
      const todayRevenue = records[i].revenueMainWithMargin + records[i].revenueOrderWithMargin
      const prevRevenueSum = records
        .slice(i - window, i)
        .reduce((acc, r) => acc + r.revenueMainWithMargin + r.revenueOrderWithMargin, 0)
      const prevRevenueAvg = prevRevenueSum / window
      if (prevRevenueAvg > 0) {
        growthRates.push(((todayRevenue - prevRevenueAvg) / prevRevenueAvg) * 100)
      }
    }

    return growthRates.length ? growthRates.reduce((acc, v) => acc + v, 0) / growthRates.length : 0
  }

  const calculateInventoryTurnover = (records: DailyRecord[]) => {
    const validRecords = records.filter((r) => r.mainStockValue + r.orderStockValue > 0)
    if (!validRecords.length) return 0

    const avgStockValue =
      validRecords.reduce((acc, r) => acc + r.mainStockValue + r.orderStockValue, 0) / validRecords.length

    const dailyRevenueWithoutMargin =
      validRecords.reduce((acc, r) => acc + r.revenueMainWithoutMargin + r.revenueOrderWithoutMargin, 0) /
      validRecords.length

    return avgStockValue ? (dailyRevenueWithoutMargin / avgStockValue) * 365 : 0
  }

  const calculateOverallMarginPercentage = (records: DailyRecord[]) => {
    const totalRevenueWithMargin = records.reduce(
      (acc, r) => acc + r.revenueMainWithMargin + r.revenueOrderWithMargin,
      0,
    )
    const totalRevenueWithoutMargin = records.reduce(
      (acc, r) => acc + r.revenueMainWithoutMargin + r.revenueOrderWithoutMargin,
      0,
    )

    return totalRevenueWithMargin
      ? ((totalRevenueWithMargin - totalRevenueWithoutMargin) / totalRevenueWithMargin) * 100
      : 0
  }

  const gmroi = calculateGMROI(recordsToUse)
  const dailyRevenueGrowth = calculateDailyRevenueGrowth(recordsToUse, 7)
  const inventoryTurnover = calculateInventoryTurnover(recordsToUse)
  const overallMargin = calculateOverallMarginPercentage(recordsToUse)

  const calcStats = (values: number[]) => ({
    max: Math.max(...values),
    min: Math.min(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  })

  const mainRevenueWithMargin = recordsToUse.map((r) => r.revenueMainWithMargin)
  const mainRevenueWithoutMargin = recordsToUse.map((r) => r.revenueMainWithoutMargin)
  const mainMargin = recordsToUse.map((r) => r.revenueMainWithMargin - r.revenueMainWithoutMargin)
  const mainStockValues = recordsToUse.map((r) => r.mainStockValue)

  const orderRevenueWithMargin = recordsToUse.map((r) => r.revenueOrderWithMargin)
  const orderRevenueWithoutMargin = recordsToUse.map((r) => r.revenueOrderWithoutMargin)
  const orderMargin = recordsToUse.map((r) => r.revenueOrderWithMargin - r.revenueOrderWithoutMargin)
  const orderStockValues = recordsToUse.map((r) => r.orderStockValue)

  const mainStats = {
    revenueWithMargin: calcStats(mainRevenueWithMargin),
    revenueWithoutMargin: calcStats(mainRevenueWithoutMargin),
    margin: calcStats(mainMargin),
    avgStock: calcStats(mainStockValues),
  }

  const orderStats = {
    revenueWithMargin: calcStats(orderRevenueWithMargin),
    revenueWithoutMargin: calcStats(orderRevenueWithoutMargin),
    margin: calcStats(orderMargin),
    avgStock: calcStats(orderStockValues),
  }

  const adviceList: string[] = []
  if (gmroi < 1.0) adviceList.push(`GMROI: Critical (Current: ${gmroi.toFixed(2)}). Losing money on inventory.`)
  else if (gmroi < 2.0) adviceList.push(`GMROI: Warning (Current: ${gmroi.toFixed(2)}). Consider markdown strategies.`)
  else if (gmroi < 3.0) adviceList.push(`GMROI: Good (Current: ${gmroi.toFixed(2)}). Maintain current strategies.`)
  else adviceList.push(`GMROI: Excellent (Current: ${gmroi.toFixed(2)}). Scale successful practices.`)

  if (dailyRevenueGrowth > 20 || dailyRevenueGrowth < -20)
    adviceList.push(`Daily Revenue Growth: Volatile (Current: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= 5)
    adviceList.push(`Daily Revenue Growth: Excellent (Current: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= 2)
    adviceList.push(`Daily Revenue Growth: Good (Current: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= -2)
    adviceList.push(`Daily Revenue Growth: Stable (Current: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= -5)
    adviceList.push(`Daily Revenue Growth: Warning (Current: ${dailyRevenueGrowth.toFixed(2)}%).`)

  if (inventoryTurnover > 12) adviceList.push(`Inventory Turnover: High (Current: ${inventoryTurnover.toFixed(2)}).`)
  else if (inventoryTurnover >= 8)
    adviceList.push(`Inventory Turnover: Excellent (Current: ${inventoryTurnover.toFixed(2)}).`)
  else if (inventoryTurnover >= 5)
    adviceList.push(`Inventory Turnover: Good (Current: ${inventoryTurnover.toFixed(2)}).`)
  else if (inventoryTurnover >= 3)
    adviceList.push(`Inventory Turnover: Average (Current: ${inventoryTurnover.toFixed(2)}).`)
  else adviceList.push(`Inventory Turnover: Poor (Current: ${inventoryTurnover.toFixed(2)}).`)

  if (overallMargin < 25) adviceList.push(`Overall Margin: Warning (Current: ${overallMargin.toFixed(2)}%).`)
  else if (overallMargin < 30.9)
    adviceList.push(`Overall Margin: Industry Average (Current: ${overallMargin.toFixed(2)}%).`)
  else if (overallMargin < 50) adviceList.push(`Overall Margin: Good (Current: ${overallMargin.toFixed(2)}%).`)
  else adviceList.push(`Overall Margin: Excellent (Current: ${overallMargin.toFixed(2)}%).`)

  const recordsWithoutToday = [...recordsToUse].slice(0, -1)

  const mainStatsWithoutToday = {
    revenueWithMargin: calcStats(recordsWithoutToday.map((r) => r.revenueMainWithMargin)),
    revenueWithoutMargin: calcStats(recordsWithoutToday.map((r) => r.revenueMainWithoutMargin)),
    margin: calcStats(recordsWithoutToday.map((r) => r.revenueMainWithMargin - r.revenueMainWithoutMargin)),
    avgStock: calcStats(recordsWithoutToday.map((r) => r.mainStockValue)),
  }

  const orderStatsWithoutToday = {
    revenueWithMargin: calcStats(recordsWithoutToday.map((r) => r.revenueOrderWithMargin)),
    revenueWithoutMargin: calcStats(recordsWithoutToday.map((r) => r.revenueOrderWithoutMargin)),
    margin: calcStats(recordsWithoutToday.map((r) => r.revenueOrderWithMargin - r.revenueOrderWithoutMargin)),
    avgStock: calcStats(recordsWithoutToday.map((r) => r.orderStockValue)),
  }

  const compareMetric = (fullAvg: number, noTodayAvg: number) => {
    return fullAvg >= noTodayAvg
  }

  const kpiMetrics = [
    { label: "GMROI", value: gmroi.toFixed(2), icon: Target, description: "Gross Margin Return on Investment" },
    {
      label: "Daily Revenue Growth",
      value: `${dailyRevenueGrowth.toFixed(2)}%`,
      icon: TrendingUp,
      description: "7-day average",
    },
    {
      label: "Inventory Turnover",
      value: `${inventoryTurnover.toFixed(2)}`,
      icon: Activity,
      description: "Times per year",
    },
    { label: "Overall Margin", value: `${overallMargin.toFixed(2)}%`, icon: Percent, description: "Percentage" },
  ]

  const selectedOption = chartOptions.find((opt) => opt.key === selectedMetric)
  let mergedData: MergedRecord[] = []

  if (chartRecords && selectedMetric) {
    if (user?.role === "CEO") {
      mergedData = Object.values(
        chartRecords.reduce(
          (acc, rec) => {
            if (!acc[rec.recordDate]) acc[rec.recordDate] = { recordDate: rec.recordDate }
            const value = rec[selectedMetric] ?? 0
            acc[rec.recordDate][rec.shopId] = value
            return acc
          },
          {} as Record<string, MergedRecord>,
        ),
      )
    } else {
      mergedData = chartRecords.map((rec) => ({
        recordDate: rec.recordDate,
        [selectedMetric]: rec[selectedMetric] ?? 0,
      }))
    }
  }

  return (
    <SidebarInset className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 bg-[var(--color-bg-secondary)]">
        <SidebarTrigger className="-ml-1 text-[var(--color-text-primary)]" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Statistics</h1>
          <p className="text-xs text-[var(--color-text-thirdly)]">Get advanced statistics about the shop</p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* CEO shop selector */}
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

        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics.map((metric, index) => {
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
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-[var(--color-text-thirdly)] mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* STORAGE STATS CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Storage Card */}
          <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Main Storage Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Revenue With Margin</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Max: {mainStats.revenueWithMargin.max.toFixed(2)} | Min:{" "}
                    {mainStats.revenueWithMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      compareMetric(mainStats.revenueWithMargin.avg, mainStatsWithoutToday.revenueWithMargin.avg)
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    Avg: {mainStats.revenueWithMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Revenue Without Margin</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Max: {mainStats.revenueWithoutMargin.max.toFixed(2)} | Min:{" "}
                    {mainStats.revenueWithoutMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      compareMetric(mainStats.revenueWithoutMargin.avg, mainStatsWithoutToday.revenueWithoutMargin.avg)
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    Avg: {mainStats.revenueWithoutMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Margin</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Max: {mainStats.margin.max.toFixed(2)} | Min: {mainStats.margin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      compareMetric(mainStats.margin.avg, mainStatsWithoutToday.margin.avg)
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    Avg: {mainStats.margin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Average Stock Value</span>
                <div
                  className={`text-sm font-semibold ${
                    compareMetric(mainStats.avgStock.avg, mainStatsWithoutToday.avgStock.avg)
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {mainStats.avgStock.avg.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Storage Card */}
          <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Storage Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Revenue With Margin</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Max: {orderStats.revenueWithMargin.max.toFixed(2)} | Min:{" "}
                    {orderStats.revenueWithMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      compareMetric(orderStats.revenueWithMargin.avg, orderStatsWithoutToday.revenueWithMargin.avg)
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    Avg: {orderStats.revenueWithMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Revenue Without Margin</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Max: {orderStats.revenueWithoutMargin.max.toFixed(2)} | Min:{" "}
                    {orderStats.revenueWithoutMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      compareMetric(
                        orderStats.revenueWithoutMargin.avg,
                        orderStatsWithoutToday.revenueWithoutMargin.avg,
                      )
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    Avg: {orderStats.revenueWithoutMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Margin</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Max: {orderStats.margin.max.toFixed(2)} | Min: {orderStats.margin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      compareMetric(orderStats.margin.avg, orderStatsWithoutToday.margin.avg)
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    Avg: {orderStats.margin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Average Stock Value</span>
                <div
                  className={`text-sm font-semibold ${
                    compareMetric(orderStats.avgStock.avg, orderStatsWithoutToday.avgStock.avg)
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {orderStats.avgStock.avg.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ADVICE CARD */}
        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <AlertCircle className="h-5 w-5 text-[var(--color-text-primary)]" />
            <CardTitle className="text-base text-[var(--color-text-primary)]">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adviceList.map((item, idx) => (
                <div
                  key={idx}
                  className="text-sm text-[var(--color-text-thirdly)] border-l-2 border-[var(--color-border)] pl-3 py-1"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Daily Records Table
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CEO-only shop selector */}
            {user?.role === "CEO" && (
              <div>
                <p className="text-sm mb-1 text-[var(--color-text-primary)]">Select shop</p>
                <Select value={tableSelectedShop} onValueChange={setTableSelectedShop}>
                  <SelectTrigger className="w-48 justify-between bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)]">
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
            <div className="flex gap-4 flex-wrap">
              <DatePicker title="From date" value={tableFromDate} onChange={setTableFromDate} />
              <DatePicker title="To date" value={tableToDate} onChange={setTableToDate} />
              <div className="flex items-end">
                <Button
                  onClick={handleTableFetch}
                  className="transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover-type2)]"
                >
                  Fetch Records
                </Button>
              </div>
            </div>

            {/* Table section */}
            <div>
              {tableLoading && <p>Loading...</p>}
              {!tableLoading && tableRecords && tableRecords.length > 0 && (
                <ScrollArea className="h-[40vh] w-full rounded-lg border border-[var(--color-border-sheet)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[var(--color-text-primary)]">Record date</TableHead>
                        {user?.role === "CEO" && (
                          <TableHead className="text-[var(--color-text-primary)]">Shop</TableHead>
                        )}
                        <TableHead className="text-[var(--color-text-primary)]">Main stock value</TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">Order stock value</TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Revenue main stock (with margin)
                        </TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Revenue main stock (without margin)
                        </TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Revenue order stock (with margin)
                        </TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Revenue order stock (without margin)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableRecords.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-[var(--color-text-secondary)]">{r.recordDate}</TableCell>
                          {user?.role === "CEO" && (
                            <TableCell className="text-[var(--color-text-secondary)]">{shops.find((s) => s.id === r.shopId)?.name || r.shopId}</TableCell>
                          )}
                          <TableCell className="text-[var(--color-text-secondary)]">{r.mainStockValue.toFixed(2)}</TableCell>
                          <TableCell className="text-[var(--color-text-secondary)]">{r.orderStockValue.toFixed(2)}</TableCell>
                          <TableCell className="text-[var(--color-text-secondary)]">{r.revenueMainWithMargin.toFixed(2)}</TableCell>
                          <TableCell className="text-[var(--color-text-secondary)]">{r.revenueMainWithoutMargin.toFixed(2)}</TableCell>
                          <TableCell className="text-[var(--color-text-secondary)]">{r.revenueOrderWithMargin.toFixed(2)}</TableCell>
                          <TableCell className="text-[var(--color-text-secondary)]">{r.revenueOrderWithoutMargin.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
              {!tableLoading && tableRecords && tableRecords.length === 0 && (
                <p className="text-[var(--color-text-secondary)] mt-4">No records found in this range.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Records Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap items-end">
              <DatePicker title="From date" value={chartFromDate} onChange={setChartFromDate} />
              <DatePicker title="To date" value={chartToDate} onChange={setChartToDate} />
              <div>
                <p className="text-sm mb-1">Select metric</p>
                <Select
                  value={selectedMetric ?? undefined}
                  onValueChange={(val) => setSelectedMetric(val as (typeof chartOptions)[number]["key"])}
                >
                  <SelectTrigger className="w-48 justify-between bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)]">
                    {chartOptions.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleChartFetch}
                  className="transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover-type2)]"
                >
                  Fetch Chart
                </Button>
              </div>
            </div>

            {user?.role === "CEO" && shops.length > 0 && (
              <div>
                <p className="text-sm mb-2">Select shops</p>
                <div className="flex flex-wrap gap-4">
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

            <div>
              {chartLoading && <p>Loading...</p>}
              {!chartLoading && chartRecords && chartRecords.length > 0 && selectedMetric && (
                <div className="w-full">
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
                                ),
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
                                className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]"
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
              {!chartLoading && chartRecords && chartRecords.length === 0 && (
                <p className="text-[var(--color-text-secondary)] mt-4">No records found in this range.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
