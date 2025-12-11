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
  { key: "mainStockValue", label: "Остатки ОСН" },
  { key: "orderStockValue", label: "Остатки ДОП" },
  { key: "revenueMainWithMargin", label: "Продажи ОСН (С Маржой)" },
  { key: "revenueMainWithoutMargin", label: "Продажи ОСН (Без Маржи)" },
  { key: "mainMargin", label: "Маржа ОСН" },
  { key: "revenueOrderWithMargin", label: "Продажи ДОП (С Маржой)" },
  { key: "revenueOrderWithoutMargin", label: "Продажи ДОП (Без Маржи)" },
  { key: "orderMargin", label: "Маржа ДОП" },
  { key: "totalMargin", label: "Общая Маржа" },
  { key: "totalRevenueWithMargin", label: "Общие Продажи (С Маржой)" },
  { key: "totalRevenueWithoutMargin", label: "Общие Продажи (Без Маржи)" },
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

interface CustomXAxisTickProps {
  x: number
  y: number
  payload: {
    value: string
  }
}

const CustomXAxisTick = (props: CustomXAxisTickProps) => {
  const { x, y, payload } = props
  const dateStr = payload.value

  const [day, month, year] = dateStr.split(".").map(Number)
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        fontSize={12}
        style={{ fill: isWeekend ? "var(--color-caution)" : "var(--color-text-thirdly)" }}
        transform="rotate(-30)"
      >
        {dateStr}
      </text>
    </g>
  )
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
        } else if (user.role === "CEO" || user.role === "READ") {
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
      toast.error("Пожалуйста выберите обе даты От и До")
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
      handleError(err, "Не удалось получить данные")
      router.push("/login")
    } finally {
      setTableLoading(false)
    }
  }

  const handleChartFetch = async () => {
    if (!chartFromDate || !chartToDate) {
      toast.error("Пожалуйста выберите обе даты От и До")
      return
    }
    if (!selectedMetric) {
      toast.error("Пожалуйста выберите метрику")
      return
    }

    setChartLoading(true)
    try {
      const data = await getRecordsByRange(formatDate(chartFromDate), formatDate(chartToDate))
      setChartRecords(data)
    } catch (err) {
      handleError(err, "Не удалось получить данные")
      router.push("/login")
    } finally {
      setChartLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!checked && selectedShops.length === 1) {
      toast.error("Как минимум должен быть выбран один магазин")
      return
    }

    setSelectAll(checked)
    if (checked) setSelectedShops(shops.map((s) => s.id))
    else setSelectedShops([])
  }

  const toggleShop = (id: string, checked: boolean) => {
    if (!checked && selectedShops.length === 1) {
      toast.error("Как минимум должен быть выбран один магазин")
      return
    }

    if (checked) setSelectedShops((prev) => [...prev, id])
    else {
      setSelectedShops((prev) => prev.filter((s) => s !== id))
      setSelectAll(false)
    }
  }

  if (!user) return <LoadingFallback message="Загрузка данных пользователя..." />
  if (error) return <Label className="text-red-500">Error: {error}</Label>
  if (!dailyRecords && user.role === "SHOP") return <LoadingFallback message="Загрузка данных..." />
  if (!allRecords && (user.role === "CEO" || user.role === "READ")) return <LoadingFallback message="Загрузка данных магазинов..." />

  let recordsToUse: DailyRecord[] = []
  if (user.role === "SHOP") {
    recordsToUse = dailyRecords!
  } else if (user.role === "CEO" || user.role === "READ") {
    if (selectedShopId === "ALL") {
      recordsToUse = allRecords ?? []
    } else {
      recordsToUse = (allRecords ?? []).filter((r) => r.shopId === selectedShopId)
    }
  }

  if (recordsToUse.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-main)] w-full h-full">
        <div
          className="flex flex-col items-center justify-center gap-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] p-6 shadow-md"
          style={{ minHeight: "25vh", minWidth: "300px" }}
        >
          <Label className="text-xl md:text-2xl text-[var(--color-text-primary)]">В данном периоде данных не обнаружено</Label>
        </div>
      </div>)
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
  if (gmroi < 1.0) adviceList.push(`GMROI: Критический (Текущий: ${gmroi.toFixed(2)}). Убытки от запасов.`)
  else if (gmroi < 2.0) adviceList.push(`GMROI: Предупреждение (Текущий: ${gmroi.toFixed(2)}). Рассмотрите стратегии уценки.`)
  else if (gmroi < 3.0) adviceList.push(`GMROI: Хорошо (Текущий: ${gmroi.toFixed(2)}). Сохраняйте текущие стратегии.`)
  else adviceList.push(`GMROI: Отлично (Текущий: ${gmroi.toFixed(2)}). Масштабируйте успешные практики.`)

  if (dailyRevenueGrowth > 20 || dailyRevenueGrowth < -20)
    adviceList.push(`Ежедневный рост выручки: Волатильный (Текущий: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= 5)
    adviceList.push(`Ежедневный рост выручки: Отличный (Текущий: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= 2)
    adviceList.push(`Ежедневный рост выручки: Хороший (Текущий: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= -2)
    adviceList.push(`Ежедневный рост выручки: Стабильный (Текущий: ${dailyRevenueGrowth.toFixed(2)}%).`)
  else if (dailyRevenueGrowth >= -5)
    adviceList.push(`Ежедневный рост выручки: Предупреждение (Текущий: ${dailyRevenueGrowth.toFixed(2)}%).`)

  if (inventoryTurnover > 12) adviceList.push(`Оборачиваемость запасов: Высокая (Текущая: ${inventoryTurnover.toFixed(2)}).`)
  else if (inventoryTurnover >= 8)
    adviceList.push(`Оборачиваемость запасов: Отличная (Текущая: ${inventoryTurnover.toFixed(2)}).`)
  else if (inventoryTurnover >= 5)
    adviceList.push(`Оборачиваемость запасов: Хорошая (Текущая: ${inventoryTurnover.toFixed(2)}).`)
  else if (inventoryTurnover >= 3)
    adviceList.push(`Оборачиваемость запасов: Средняя (Текущая: ${inventoryTurnover.toFixed(2)}).`)
  else adviceList.push(`Оборачиваемость запасов: Низкая (Текущая: ${inventoryTurnover.toFixed(2)}).`)

  if (overallMargin < 25) adviceList.push(`Общая маржа: Предупреждение (Текущая: ${overallMargin.toFixed(2)}%).`)
  else if (overallMargin < 30.9)
    adviceList.push(`Общая маржа: Средняя по отрасли (Текущая: ${overallMargin.toFixed(2)}%).`)
  else if (overallMargin < 50) adviceList.push(`Общая маржа: Хорошая (Текущая: ${overallMargin.toFixed(2)}%).`)
  else adviceList.push(`Общая маржа: Отличная (Текущая: ${overallMargin.toFixed(2)}%).`)

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
    {
      label: "GMROI",
      value: gmroi.toFixed(2),
      icon: Target,
      description: "Валовая рентабельность инвестиций в запасы"
    },
    {
      label: "Ежедневный рост выручки",
      value: `${dailyRevenueGrowth.toFixed(2)}%`,
      icon: TrendingUp,
      description: "7-дневное скользящее среднее",
    },
    {
      label: "Оборачиваемость запасов",
      value: `${inventoryTurnover.toFixed(2)}`,
      icon: Activity,
      description: "Раз в год",
    },
    {
      label: "Общая маржа",
      value: `${overallMargin.toFixed(2)}%`,
      icon: Percent,
      description: "Процент"
    },
  ]
  const selectedOption = chartOptions.find((opt) => opt.key === selectedMetric)
  let mergedData: MergedRecord[] = []

  const getMetricValue = (rec: DailyRecord, metric: string): number => {
    switch (metric) {
      case "mainMargin":
        return rec.revenueMainWithMargin - rec.revenueMainWithoutMargin
      case "orderMargin":
        return rec.revenueOrderWithMargin - rec.revenueOrderWithoutMargin
      case "totalRevenueWithMargin":
        return rec.revenueMainWithMargin + rec.revenueOrderWithMargin
      case "totalRevenueWithoutMargin":
        return rec.revenueMainWithoutMargin + rec.revenueOrderWithoutMargin
      case "totalMargin":
        return (
          rec.revenueMainWithMargin +
          rec.revenueOrderWithMargin -
          rec.revenueMainWithoutMargin -
          rec.revenueOrderWithoutMargin
        )
      default:
        return (rec[metric as keyof DailyRecord] as number) ?? 0
    }
  }

  const latestShopValues: Record<string, number> = {}
  if (chartRecords && selectedMetric) {
    // chartRecords might not be sorted by date, but usually they come sorted from backend. 
    // We can rely on recordDate. Or better, just parse and sort if needed.
    // However, for simplicity and performance, assuming we want the "latest available" 
    // record for each shop, we can iterate.
    // If we want the value at the END of the chart range, we should prioritize later dates.

    // Let's sort a copy of chartRecords by date just to be sure
    const sortedRecords = [...chartRecords].sort((a, b) => {
      const [d1, m1, y1] = a.recordDate.split('.').map(Number)
      const [d2, m2, y2] = b.recordDate.split('.').map(Number)
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()
    })

    const isMarginMetric = ["mainMargin", "orderMargin", "totalMargin"].includes(selectedMetric)

    for (const rec of sortedRecords) {
      if (isMarginMetric) {
        latestShopValues[rec.shopId] = (latestShopValues[rec.shopId] || 0) + getMetricValue(rec, selectedMetric)
      } else {
        latestShopValues[rec.shopId] = getMetricValue(rec, selectedMetric)
      }
    }

    if (user?.role === "CEO") {
      mergedData = Object.values(
        sortedRecords.reduce(
          (acc, rec) => {
            if (!acc[rec.recordDate]) acc[rec.recordDate] = { recordDate: rec.recordDate }
            const value = getMetricValue(rec, selectedMetric)
            acc[rec.recordDate][rec.shopId] = value
            return acc
          },
          {} as Record<string, MergedRecord>,
        ),
      )
    } else {
      mergedData = sortedRecords.map((rec) => ({
        recordDate: rec.recordDate,
        [selectedMetric]: getMetricValue(rec, selectedMetric),
      }))
    }
  }

  return (
    <SidebarInset className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 bg-[var(--color-bg-secondary)]">
        <SidebarTrigger className="-ml-1 text-[var(--color-text-primary)]" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Статистика</h1>
          <p className="text-xs text-[var(--color-text-thirdly)]">Развёрнутая статистика о магазине</p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-6 p-6 w-[100%]">
        {/* CEO shop selector */}
        {(user.role === "CEO" || user.role === "READ") && (
          <div>
            <Label className="mb-1 text-lg text-[var(--color-text-primary)]">Выберите магазин</Label>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-48 bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                <SelectValue placeholder="Выберите магазин" />
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
                Статистики ОСН
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Продажи С Маржой</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Макс: {mainStats.revenueWithMargin.max.toFixed(2)} | Мин:{" "}
                    {mainStats.revenueWithMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${compareMetric(mainStats.revenueWithMargin.avg, mainStatsWithoutToday.revenueWithMargin.avg)
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    Средняя: {mainStats.revenueWithMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Продажи Без Маржи</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Макс: {mainStats.revenueWithoutMargin.max.toFixed(2)} | Мин:{" "}
                    {mainStats.revenueWithoutMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${compareMetric(mainStats.revenueWithoutMargin.avg, mainStatsWithoutToday.revenueWithoutMargin.avg)
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    Средняя: {mainStats.revenueWithoutMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Маржа</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Макс: {mainStats.margin.max.toFixed(2)} | Мин: {mainStats.margin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${compareMetric(mainStats.margin.avg, mainStatsWithoutToday.margin.avg)
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    Средняя: {mainStats.margin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Средние Остатки</span>
                <div
                  className={`text-sm font-semibold ${compareMetric(mainStats.avgStock.avg, mainStatsWithoutToday.avgStock.avg)
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
                Статистики ДОП
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Продажи С Маржой</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Макс: {orderStats.revenueWithMargin.max.toFixed(2)} | Мин:{" "}
                    {orderStats.revenueWithMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${compareMetric(orderStats.revenueWithMargin.avg, orderStatsWithoutToday.revenueWithMargin.avg)
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    Средняя: {orderStats.revenueWithMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Продажи Без Маржи</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Макс: {orderStats.revenueWithoutMargin.max.toFixed(2)} | Мин:{" "}
                    {orderStats.revenueWithoutMargin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${compareMetric(
                      orderStats.revenueWithoutMargin.avg,
                      orderStatsWithoutToday.revenueWithoutMargin.avg,
                    )
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    Средняя: {orderStats.revenueWithoutMargin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Маржа</span>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-thirdly)]">
                    Макс: {orderStats.margin.max.toFixed(2)} | Мин: {orderStats.margin.min.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${compareMetric(orderStats.margin.avg, orderStatsWithoutToday.margin.avg)
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    Средняя: {orderStats.margin.avg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-thirdly)]">Средние Остатки</span>
                <div
                  className={`text-sm font-semibold ${compareMetric(orderStats.avgStock.avg, orderStatsWithoutToday.avgStock.avg)
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
            <CardTitle className="text-base text-[var(--color-text-primary)]">Советы По Эффективности</CardTitle>
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
              Таблица Записей
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CEO-only shop selector */}
            {user?.role === "CEO" && (
              <div>
                <p className="text-sm mb-1 text-[var(--color-text-primary)]">Выберите магазин</p>
                <Select value={tableSelectedShop} onValueChange={setTableSelectedShop}>
                  <SelectTrigger className="w-48 justify-between bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                    <SelectValue placeholder="Выберите магазин" />
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
              <DatePicker title="От" value={tableFromDate} onChange={setTableFromDate} />
              <DatePicker title="До" value={tableToDate} onChange={setTableToDate} />
              <div className="flex items-end">
                <Button
                  onClick={handleTableFetch}
                  className="transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover-type2)]"
                >
                  Получить Данные
                </Button>
              </div>
            </div>

            {/* Table section */}
            <div>
              {tableLoading && <p>Загрузка...</p>}
              {!tableLoading && tableRecords && tableRecords.length > 0 && (
                <ScrollArea className="h-[40vh] w-full rounded-lg border border-[var(--color-border-sheet)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[var(--color-text-primary)]">Дата</TableHead>
                        {user?.role === "CEO" && (
                          <TableHead className="text-[var(--color-text-primary)]">Магазин</TableHead>
                        )}
                        <TableHead className="text-[var(--color-text-primary)]">Остатки ОСН</TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">Остатки ДОП</TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Продажи ОСН (С Маржой)
                        </TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Продажи ОСН (Без Маржи)
                        </TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Продажи ДОП (С Маржой)
                        </TableHead>
                        <TableHead className="text-[var(--color-text-primary)]">
                          Продажи ДОП (Без Маржи)
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
                <p className="text-[var(--color-text-secondary)] mt-4">В данном периоде данных не обнаружено.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              График Записей
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex flex-col gap-4 min-w-[200px] shrink-0">
                  <DatePicker title="От" value={chartFromDate} onChange={setChartFromDate} />
                  <DatePicker title="До" value={chartToDate} onChange={setChartToDate} />
                  <div>
                    <p className="text-sm mb-1 text-[var(--color-text-primary)]">Выберите метрику</p>
                    <Select
                      value={selectedMetric ?? undefined}
                      onValueChange={(val) => setSelectedMetric(val as (typeof chartOptions)[number]["key"])}
                    >
                      <SelectTrigger className="w-48 justify-between bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] hover:text-[var(--color-text-primary)]">
                        <SelectValue placeholder="Выберите метрику" />
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
                  <Button
                    onClick={handleChartFetch}
                    className="w-48 transition bg-[var(--color-button-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover-type2)]"
                  >
                    Получить График
                  </Button>
                </div>
                {user?.role === "CEO" && shops.length > 0 && (
                  <div className="flex-1 w-full min-w-0 space-y-2">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Список Магазинов</p>
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-main)]">
                      <ScrollArea className="h-[35vh]">
                        <div className="flex flex-col gap-2 p-4 min-w-max">
                          {shops.map((shop, idx) => (
                            <label
                              key={shop.id}
                              className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-secondary)] rounded-md cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={selectedShops.includes(shop.id)}
                                onCheckedChange={(checked) => toggleShop(shop.id, !!checked)}
                              />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: lineColors[idx % lineColors.length],
                                  }}
                                ></span>
                                <span className="text-sm whitespace-nowrap flex-1" title={shop.name}>
                                  {shop.name}
                                </span>
                                {latestShopValues[shop.id] !== undefined && (
                                  <span className="text-sm font-mono tabular-nums text-right ml-4">
                                    {Math.round(latestShopValues[shop.id]).toLocaleString("ru-RU")}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full min-w-0">
                {chartLoading && (
                  <div className="h-[40vh] flex items-center justify-center">
                    <LoadingFallback message="Загрузка графика..." />
                  </div>
                )}
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
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mergedData} margin={{ bottom: 20, right: 30, top: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis
                            dataKey="recordDate"
                            interval="preserveStartEnd"
                            tick={CustomXAxisTick}
                            angle={-30}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                          />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: "var(--color-bg-secondary)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "8px",
                              color: "var(--color-text-primary)",
                            }}
                            content={<ChartTooltipContent hideIndicator={true} />}
                          />

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
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 4 }}
                                    strokeWidth={2}
                                  />
                                ),
                            )}

                          {user?.role === "SHOP" && (
                            <Line
                              type="monotone"
                              dataKey={selectedMetric}
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}
                {!chartLoading && chartRecords && chartRecords.length === 0 && (
                  <div className="h-[40vh] flex items-center justify-center border border-dashed border-[var(--color-border)] rounded-lg">
                    <p className="text-[var(--color-text-secondary)]">Нет данных за выбранный период.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card >
      </div >
    </SidebarInset >
  )
}
