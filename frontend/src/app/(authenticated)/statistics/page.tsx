"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/atoms/label";
import { GetChartDialog } from "@/components/molecules/get-chart-dialog";
import { GetTableDialog } from "@/components/molecules/get-table-dialog";
import { LoadingFallback } from "@/components/molecules/loading-fallback";
import { DailyRecord, Shop } from "@/lib/types";
import { getRecordsByRange, getAllShops } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/atoms/accordion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms/select";

export default function StatisticsPage() {
  const { user } = useUser();
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[] | null>(null);
  const [allRecords, setAllRecords] = useState<DailyRecord[] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>("ALL");

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  useEffect(() => {
    async function loadRecords() {
      try {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - 29);

        const fromDateStr = formatDate(fromDate);
        const toDateStr = formatDate(toDate);

        if (!user) return;

        if (user.role === "SHOP") {
          const records = await getRecordsByRange(fromDateStr, toDateStr);
          setDailyRecords(records);
        } else if (user.role === "CEO") {
          const allShops = await getAllShops();
          setShops(allShops.filter((s) => s.role === "SHOP").sort((a, b) => a.name.localeCompare(b.name)));

          const records = await getRecordsByRange(fromDateStr, toDateStr); 
          setAllRecords(records);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load records");
      }
    }
    loadRecords();
  }, [user]);

  if (!user) return <LoadingFallback message="Loading user info..." />;
  if (error) return <Label className="text-red-500">Error: {error}</Label>;
  if (!dailyRecords && user.role === "SHOP") return <LoadingFallback message="Loading records..." />;
  if (!allRecords && user.role === "CEO") return <LoadingFallback message="Loading records for all shops..." />;

  let recordsToUse: DailyRecord[] = [];
  if (user.role === "SHOP") {
    recordsToUse = dailyRecords!;
  } else if (user.role === "CEO") {
    if (selectedShopId === "ALL") {
      recordsToUse = allRecords ?? [];
    } else {
      recordsToUse = (allRecords ?? []).filter((r) => r.shopId === selectedShopId);
    }
  }

  if (recordsToUse.length === 0) {
    return <Label>No records found in the selected date range.</Label>;
  }

  const calculateGMROI = (records: DailyRecord[]) => {
    const validRecords = records.filter(r => r.mainStockValue + r.orderStockValue > 0);
    if (!validRecords.length) return 0;

    const avgStockValue =
      validRecords.reduce((acc, r) => acc + r.mainStockValue + r.orderStockValue, 0) /
      validRecords.length;

    const totalRevenueWithMargin = validRecords.reduce(
      (acc, r) => acc + r.revenueMainWithMargin + r.revenueOrderWithMargin,
      0
    );
    const totalRevenueWithoutMargin = validRecords.reduce(
      (acc, r) => acc + r.revenueMainWithoutMargin + r.revenueOrderWithoutMargin,
      0
    );

    return avgStockValue ? (totalRevenueWithMargin - totalRevenueWithoutMargin) / avgStockValue : 0;
  };

  const calculateDailyRevenueGrowth = (records: DailyRecord[], window = 7) => {
    if (records.length < 2) return 0;

    const growthRates: number[] = [];
    for (let i = window; i < records.length; i++) {
      const todayRevenue = records[i].revenueMainWithMargin + records[i].revenueOrderWithMargin;
      const prevRevenueSum = records
        .slice(i - window, i)
        .reduce((acc, r) => acc + r.revenueMainWithMargin + r.revenueOrderWithMargin, 0);
      const prevRevenueAvg = prevRevenueSum / window;
      if (prevRevenueAvg > 0) {
        growthRates.push(((todayRevenue - prevRevenueAvg) / prevRevenueAvg) * 100);
      }
    }

    return growthRates.length
      ? growthRates.reduce((acc, v) => acc + v, 0) / growthRates.length
      : 0;
  };

  const calculateInventoryTurnover = (records: DailyRecord[]) => {
    const validRecords = records.filter(r => r.mainStockValue + r.orderStockValue > 0);
    if (!validRecords.length) return 0;

    const avgStockValue =
      validRecords.reduce((acc, r) => acc + r.mainStockValue + r.orderStockValue, 0) /
      validRecords.length;

    const dailyRevenueWithoutMargin =
      validRecords.reduce(
        (acc, r) => acc + r.revenueMainWithoutMargin + r.revenueOrderWithoutMargin,
        0
      ) / validRecords.length;

    return avgStockValue ? (dailyRevenueWithoutMargin / avgStockValue) * 365 : 0;
  };

  const calculateOverallMarginPercentage = (records: DailyRecord[]) => {
    const totalRevenueWithMargin = records.reduce(
      (acc, r) => acc + r.revenueMainWithMargin + r.revenueOrderWithMargin,
      0
    );
    const totalRevenueWithoutMargin = records.reduce(
      (acc, r) => acc + r.revenueMainWithoutMargin + r.revenueOrderWithoutMargin,
      0
    );

    return totalRevenueWithMargin
      ? ((totalRevenueWithMargin - totalRevenueWithoutMargin) / totalRevenueWithMargin) * 100
      : 0;
  };

  const gmroi = calculateGMROI(recordsToUse);
  const dailyRevenueGrowth = calculateDailyRevenueGrowth(recordsToUse, 7);
  const inventoryTurnover = calculateInventoryTurnover(recordsToUse);
  const overallMargin = calculateOverallMarginPercentage(recordsToUse);

  const calcStats = (values: number[]) => ({
    max: Math.max(...values),
    min: Math.min(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  });

  const mainRevenueWithMargin = recordsToUse.map(r => r.revenueMainWithMargin);
  const mainRevenueWithoutMargin = recordsToUse.map(r => r.revenueMainWithoutMargin);
  const mainMargin = recordsToUse.map(r => r.revenueMainWithMargin - r.revenueMainWithoutMargin);
  const mainStockValues = recordsToUse.map(r => r.mainStockValue);

  const orderRevenueWithMargin = recordsToUse.map(r => r.revenueOrderWithMargin);
  const orderRevenueWithoutMargin = recordsToUse.map(r => r.revenueOrderWithoutMargin);
  const orderMargin = recordsToUse.map(r => r.revenueOrderWithMargin - r.revenueOrderWithoutMargin);
  const orderStockValues = recordsToUse.map(r => r.orderStockValue);

  const mainStats = {
    revenueWithMargin: calcStats(mainRevenueWithMargin),
    revenueWithoutMargin: calcStats(mainRevenueWithoutMargin),
    margin: calcStats(mainMargin),
    avgStock: calcStats(mainStockValues),
  };

  const orderStats = {
    revenueWithMargin: calcStats(orderRevenueWithMargin),
    revenueWithoutMargin: calcStats(orderRevenueWithoutMargin),
    margin: calcStats(orderMargin),
    avgStock: calcStats(orderStockValues),
  };

  const adviceList: string[] = [];
  if (gmroi < 1.0) adviceList.push(`GMROI: Critical (Current: ${gmroi.toFixed(2)}). Losing money on inventory.`);
  else if (gmroi < 2.0) adviceList.push(`GMROI: Warning (Current: ${gmroi.toFixed(2)}). Consider markdown strategies.`);
  else if (gmroi < 3.0) adviceList.push(`GMROI: Good (Current: ${gmroi.toFixed(2)}). Maintain current strategies.`);
  else adviceList.push(`GMROI: Excellent (Current: ${gmroi.toFixed(2)}). Scale successful practices.`);

  if (dailyRevenueGrowth > 20 || dailyRevenueGrowth < -20)
    adviceList.push(`Daily Revenue Growth: Volatile (Current: ${dailyRevenueGrowth.toFixed(2)}%).`);
  else if (dailyRevenueGrowth >= 5)
    adviceList.push(`Daily Revenue Growth: Excellent (Current: ${dailyRevenueGrowth.toFixed(2)}%).`);
  else if (dailyRevenueGrowth >= 2)
    adviceList.push(`Daily Revenue Growth: Good (Current: ${dailyRevenueGrowth.toFixed(2)}%).`);
  else if (dailyRevenueGrowth >= -2)
    adviceList.push(`Daily Revenue Growth: Stable (Current: ${dailyRevenueGrowth.toFixed(2)}%).`);
  else if (dailyRevenueGrowth >= -5)
    adviceList.push(`Daily Revenue Growth: Warning (Current: ${dailyRevenueGrowth.toFixed(2)}%).`);

  if (inventoryTurnover > 12) adviceList.push(`Inventory Turnover: High (Current: ${inventoryTurnover.toFixed(2)}).`);
  else if (inventoryTurnover >= 8) adviceList.push(`Inventory Turnover: Excellent (Current: ${inventoryTurnover.toFixed(2)}).`);
  else if (inventoryTurnover >= 5) adviceList.push(`Inventory Turnover: Good (Current: ${inventoryTurnover.toFixed(2)}).`);
  else if (inventoryTurnover >= 3) adviceList.push(`Inventory Turnover: Average (Current: ${inventoryTurnover.toFixed(2)}).`);
  else adviceList.push(`Inventory Turnover: Poor (Current: ${inventoryTurnover.toFixed(2)}).`);

  if (overallMargin < 25) adviceList.push(`Overall Margin: Warning (Current: ${overallMargin.toFixed(2)}%).`);
  else if (overallMargin < 30.9) adviceList.push(`Overall Margin: Industry Average (Current: ${overallMargin.toFixed(2)}%).`);
  else if (overallMargin < 50) adviceList.push(`Overall Margin: Good (Current: ${overallMargin.toFixed(2)}%).`);
  else adviceList.push(`Overall Margin: Excellent (Current: ${overallMargin.toFixed(2)}%).`);


  const recordsWithoutToday = [...recordsToUse].slice(0, -1);

  const mainStatsWithoutToday = {
    revenueWithMargin: calcStats(recordsWithoutToday.map(r => r.revenueMainWithMargin)),
    revenueWithoutMargin: calcStats(recordsWithoutToday.map(r => r.revenueMainWithoutMargin)),
    margin: calcStats(recordsWithoutToday.map(r => r.revenueMainWithMargin - r.revenueMainWithoutMargin)),
        avgStock: calcStats(recordsWithoutToday.map(r => r.mainStockValue)),
  };

  const orderStatsWithoutToday = {
    revenueWithMargin: calcStats(recordsWithoutToday.map(r => r.revenueOrderWithMargin)),
    revenueWithoutMargin: calcStats(recordsWithoutToday.map(r => r.revenueOrderWithoutMargin)),
    margin: calcStats(recordsWithoutToday.map(r => r.revenueOrderWithMargin - r.revenueOrderWithoutMargin)),
    avgStock: calcStats(recordsWithoutToday.map(r => r.orderStockValue)),
  };

  const compareMetric = (fullAvg: number, noTodayAvg: number) => {
    return fullAvg >= noTodayAvg;
  }

  return (
    <div className="flex flex-col">
      <Label className="text-3xl font-bold mb-1">Statistics</Label>
      <Label className="text-lg text-[#f0f0f0] mb-6">Get advanced statistics about the shop</Label>

      {/* --- CEO shop selector --- */}
      {user.role === "CEO" && (
        <div className="mb-4">
          <Label className="mb-1">Select Shop:</Label>
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Accordion + KPIs */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-[40vw] overflow-y-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="main">
                <AccordionTrigger className="text-lg w-full text-left">
                  Main Storage Stats
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1 w-full">
                  <Label>
                    Revenue With Margin - Max: {mainStats.revenueWithMargin.max.toFixed(2)}, Min:{" "}
                    {mainStats.revenueWithMargin.min.toFixed(2)}, Avg:{" "}
                    <span
                      className={
                        compareMetric(
                          mainStats.revenueWithMargin.avg,
                          mainStatsWithoutToday.revenueWithMargin.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {mainStats.revenueWithMargin.avg.toFixed(2)}
                    </span>
                  </Label>

                  <Label>
                    Revenue Without Margin - Max: {mainStats.revenueWithoutMargin.max.toFixed(2)}, Min:{" "}
                    {mainStats.revenueWithoutMargin.min.toFixed(2)}, Avg:{" "}
                    <span
                      className={
                        compareMetric(
                          mainStats.revenueWithoutMargin.avg,
                          mainStatsWithoutToday.revenueWithoutMargin.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {mainStats.revenueWithoutMargin.avg.toFixed(2)}
                    </span>
                  </Label>

                  <Label>
                    Margin - Max: {mainStats.margin.max.toFixed(2)}, Min:{" "}
                    {mainStats.margin.min.toFixed(2)}, Avg:{" "}
                    <span
                      className={
                        compareMetric(
                          mainStats.margin.avg,
                          mainStatsWithoutToday.margin.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {mainStats.margin.avg.toFixed(2)}
                    </span>
                  </Label>

                  <Label>
                    Average Stock Value:{" "}
                    <span
                      className={
                        compareMetric(
                          mainStats.avgStock.avg,
                          mainStatsWithoutToday.avgStock.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {mainStats.avgStock.avg.toFixed(2)}
                    </span>
                  </Label>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="order">
                <AccordionTrigger className="text-lg w-full text-left">
                  Order Storage Stats
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1 w-full">
                  <Label>
                    Revenue With Margin - Max: {orderStats.revenueWithMargin.max.toFixed(2)}, Min:{" "}
                    {orderStats.revenueWithMargin.min.toFixed(2)}, Avg:{" "}
                    <span
                      className={
                        compareMetric(
                          orderStats.revenueWithMargin.avg,
                          orderStatsWithoutToday.revenueWithMargin.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {orderStats.revenueWithMargin.avg.toFixed(2)}
                    </span>
                  </Label>

                  <Label>
                    Revenue Without Margin - Max: {orderStats.revenueWithoutMargin.max.toFixed(2)}, Min:{" "}
                    {orderStats.revenueWithoutMargin.min.toFixed(2)}, Avg:{" "}
                    <span
                      className={
                        compareMetric(
                          orderStats.revenueWithoutMargin.avg,
                          orderStatsWithoutToday.revenueWithoutMargin.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {orderStats.revenueWithoutMargin.avg.toFixed(2)}
                    </span>
                  </Label>

                  <Label>
                    Margin - Max: {orderStats.margin.max.toFixed(2)}, Min:{" "}
                    {orderStats.margin.min.toFixed(2)}, Avg:{" "}
                    <span
                      className={
                        compareMetric(
                          orderStats.margin.avg,
                          orderStatsWithoutToday.margin.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {orderStats.margin.avg.toFixed(2)}
                    </span>
                  </Label>

                  <Label>
                    Average Stock Value:{" "}
                    <span
                      className={
                        compareMetric(
                          orderStats.avgStock.avg,
                          orderStatsWithoutToday.avgStock.avg
                        )
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {orderStats.avgStock.avg.toFixed(2)}
                    </span>
                  </Label>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

          {/* KPI Stats */}
          <div className="flex flex-col gap-y-4 mt-4">
            <Label className="text-xl">GMROI: {gmroi.toFixed(2)}</Label>
            <Label className="text-xl">Daily Revenue Growth (7-day avg): {dailyRevenueGrowth.toFixed(2)}%</Label>
            <Label className="text-xl">Inventory Turnover Rate: {inventoryTurnover.toFixed(2)} times/year</Label>
            <Label className="text-xl">Overall Margin Percentage: {overallMargin.toFixed(2)}%</Label>
          </div>

          <div className="flex flex-row mt-6 gap-x-5">
            <GetTableDialog />
            <GetChartDialog />
          </div>
        </div>

        {/* Right column: Advice */}
        <div className="mt-4 mr-4 lg:mt-0">
          <div className="p-4 rounded-md bg-[#292929] flex flex-col justify-start">
            <Label className="font-semibold text-xl text-[#f0f0f0] mb-2">Advice</Label>
            <div className="flex flex-col gap-1">
              {adviceList.map((item, idx) => (
                <Label key={idx} className="text-md text-gray-300 block">
                  {item}
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
