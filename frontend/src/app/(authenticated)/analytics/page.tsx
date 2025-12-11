"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/atoms/label"
import { LoadingFallback } from "@/components/molecules/loading-fallback"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/card"
import type { DailyRecord, Shop } from "@/lib/types"
import { getRecordsByRange, getAllShops, getProphetForecast } from "@/lib/api"
import { useUser } from "@/components/providers/user-provider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms/select"
import { handleError } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { TrendingUp, Package, AlertCircle, BarChart3 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/atoms/sidebar"
import { Button } from "@/components/atoms/button"
import { toast } from "sonner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/molecules/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

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

interface ChartDataPoint {
  date: string
  actual?: number
  predicted?: number
  type: "actual" | "predicted"
}

interface ProphetForecastItem {
  ds: string
  yhat: number
  yhat_lower?: number
  yhat_upper?: number
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

export default function AnalyticsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShopId, setSelectedShopId] = useState<string>("")
  const [selectedMetric, setSelectedMetric] = useState<(typeof chartOptions)[number]["key"]>("totalRevenueWithMargin")
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (chartData.length) {
      // eslint-disable-next-line no-console
      console.debug('Analytics chartData (merged):', chartData)
    }
  }, [chartData])

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  function parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr.split(".")
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  useEffect(() => {
    async function loadShops() {
      try {
        if (!user) return

        if (user.role === "SHOP") {
          setSelectedShopId("current")
          await loadChartData("current", selectedMetric)
        } else if (user.role === "CEO" || user.role === "READ") {
          const allShops = await getAllShops()
          const filteredShops = allShops.filter((s) => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name))
          setShops(filteredShops)
          if (filteredShops.length > 0) {
            setSelectedShopId(filteredShops[0].id)
            await loadChartData(filteredShops[0].id, selectedMetric)
          }
        }
      } catch (err) {
        handleError(err)
        router.push("/login")
      }
    }
    loadShops()
  }, [user])

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

  const loadChartData = async (shopId: string, metric: string) => {
    setLoading(true)
    setError(null)

    try {
      const today = new Date()
      const fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const fromDateStr = formatDate(fromDate)
      const toDateStr = formatDate(toDate)

      const actualRecords = await getRecordsByRange(fromDateStr, toDateStr)
      let filteredRecords = actualRecords

      if ((user?.role === "CEO" || user?.role === "READ") && shopId !== "ALL") {
        filteredRecords = actualRecords.filter((r) => r.shopId === shopId)
      }

      const daysToPredict = Math.max(0, toDate.getDate() - today.getDate())
      const predictions = daysToPredict > 0
        ? await getProphetForecast(shopId === "current" ? undefined : shopId, daysToPredict, metric)
        : null

      const data: ChartDataPoint[] = []

      // Aggregate actuals by date
      const dailyActuals = new Map<string, number>()
      filteredRecords.forEach((rec) => {
        const val = getMetricValue(rec, metric)
        const current = dailyActuals.get(rec.recordDate) || 0
        dailyActuals.set(rec.recordDate, current + val)
      })

      dailyActuals.forEach((value, date) => {
        data.push({
          date,
          actual: value,
          type: "actual",
        })
      })

      if (predictions && predictions.forecast && Array.isArray(predictions.forecast)) {
        predictions.forecast.forEach((pred: ProphetForecastItem) => {
          // Prophet service returns ds (date string in YYYY-MM-DD format)
          const forecastDateStr = pred.ds;
          // Convert YYYY-MM-DD to DD.MM.YYYY for consistency
          const [year, month, day] = forecastDateStr.split('-');
          const formattedDate = `${day}.${month}.${year}`;
          data.push({
            date: formattedDate,
            predicted: pred.yhat || 0,
            type: "predicted",
          })
        })
      }

      data.sort((a, b) => {
        const dateA = parseDateString(a.date).getTime()
        const dateB = parseDateString(b.date).getTime()
        return dateA - dateB
      })

      const mergedData: ChartDataPoint[] = []
      const dateMap = new Map<string, ChartDataPoint>()

      data.forEach((item) => {
        const existing = dateMap.get(item.date)
        if (existing) {
          mergedData[mergedData.indexOf(existing)] = { ...existing, ...item }
          dateMap.set(item.date, mergedData[mergedData.length - 1])
        } else {
          const merged: ChartDataPoint = {
            date: item.date,
            actual: item.actual,
            predicted: item.predicted,
            type: item.type,
          }
          mergedData.push(merged)
          dateMap.set(item.date, merged)
        }
      })

      // Log merged chart data before setting state
      // eslint-disable-next-line no-console
      setChartData(mergedData)
    } catch (err) {
      handleError(err, "Не удалось загрузить данные графика")
      setError("Ошибка при загрузке данных")
    } finally {
      setLoading(false)
    }
  }

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric as (typeof chartOptions)[number]["key"])
    if (selectedShopId) {
      loadChartData(selectedShopId, metric)
    }
  }

  const handleShopChange = (shopId: string) => {
    setSelectedShopId(shopId)
    loadChartData(shopId, selectedMetric)
  }

  if (!user) return <LoadingFallback message="Загрузка данных пользователя..." />
  if (error) return <Label className="text-red-500">Error: {error}</Label>

  const selectedOption = chartOptions.find((opt) => opt.key === selectedMetric)

  return (
    <SidebarInset className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 bg-[var(--color-bg-secondary)]">
        <SidebarTrigger className="-ml-1 text-[var(--color-text-primary)]" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Аналитика</h1>
          <p className="text-xs text-[var(--color-text-thirdly)]">Прогнозы и анализ метрик магазина</p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Shop Selector */}
          {(user.role === "CEO" || user.role === "READ") && shops.length > 0 && (
            <div>
              <Label className="mb-1 text-sm text-[var(--color-text-primary)]">Выберите магазин</Label>
              <Select value={selectedShopId} onValueChange={handleShopChange}>
                <SelectTrigger className="bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]">
                  <SelectValue placeholder="Выберите магазин" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                  <SelectItem value="ALL">Все магазины</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}


          {/* Metric Selector */}
          <div>
            <Label className="mb-1 text-sm text-[var(--color-text-primary)]">Выберите метрику</Label>
            <Select value={selectedMetric} onValueChange={handleMetricChange}>
              <SelectTrigger className="bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]">
                <SelectValue placeholder="Выберите метрику" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                {chartOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Chart Card */}
        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {selectedOption?.label} - Текущий месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[40vh] flex items-center justify-center">
                <LoadingFallback message="Загрузка..." />
              </div>
            ) : chartData.length > 0 ? (
              <ChartContainer config={{}} className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ bottom: 20, right: 10, top: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="date"
                      interval="preserveStartEnd"
                      tick={CustomXAxisTick}
                      angle={-30}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="var(--color-text-thirdly)"
                      tick={{ fontSize: 12 }}
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
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8", r: 2 }}
                      activeDot={{ r: 4 }}
                      name="Фактические данные"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#82ca9d", r: 2 }}
                      activeDot={{ r: 4 }}
                      name="Прогноз"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-[var(--color-text-secondary)]">Данные не найдены</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <AlertCircle className="h-5 w-5 text-[var(--color-text-primary)]" />
            <CardTitle className="text-base text-[var(--color-text-primary)]">Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[var(--color-text-thirdly)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-[#8884d8]"></div>
                <p>Синяя линия показывает фактические данные с начала месяца</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-[#82ca9d] border-t-2 border-dashed" style={{ borderTopStyle: 'dashed' }}></div>
                <p>Зелёная пунктирная линия показывает прогноз до конца месяца</p>
              </div>
              <p className="mt-4 text-xs">Прогнозы основаны на методе Prophet и анализируют исторические данные метрики для предсказания будущих тенденций.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
