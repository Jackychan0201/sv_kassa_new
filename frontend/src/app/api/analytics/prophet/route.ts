import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = url.searchParams;

  const shopId = params.get("shopId");
  const metric = params.get("metric");
  const periods = Number(params.get("periods") || 30);

  try {
    // Fetch historical records for this shop from backend
    const recordsRes = await apiRequest(`/daily-records${shopId ? `?shopId=${shopId}` : ""}`, req);
    if (!recordsRes.ok) {
      const errorData = await recordsRes.json().catch(() => null);
      return NextResponse.json({ message: (errorData?.message) || "Failed to fetch daily records" }, { status: recordsRes.status });
    }

    const records = await recordsRes.json();

    // Prepare data for Prophet
    const dates: string[] = [];
    const values: number[] = [];

    records.forEach((r: any) => {
      const [day, month, year] = r.recordDate.split(".");
      dates.push(`${year}-${month}-${day}`);
      let value = 0;
      switch (metric) {
        case "mainStockValue": value = r.mainStockValue ?? 0; break;
        case "orderStockValue": value = r.orderStockValue ?? 0; break;
        case "revenueMainWithMargin": value = r.revenueMainWithMargin ?? 0; break;
        case "revenueMainWithoutMargin": value = r.revenueMainWithoutMargin ?? 0; break;
        case "mainMargin": value = (r.revenueMainWithMargin ?? 0) - (r.revenueMainWithoutMargin ?? 0); break;
        case "revenueOrderWithMargin": value = r.revenueOrderWithMargin ?? 0; break;
        case "revenueOrderWithoutMargin": value = r.revenueOrderWithoutMargin ?? 0; break;
        case "orderMargin": value = (r.revenueOrderWithMargin ?? 0) - (r.revenueOrderWithoutMargin ?? 0); break;
        case "totalRevenueWithMargin": value = (r.revenueMainWithMargin ?? 0) + (r.revenueOrderWithMargin ?? 0); break;
        case "totalRevenueWithoutMargin": value = (r.revenueMainWithoutMargin ?? 0) + (r.revenueOrderWithoutMargin ?? 0); break;
        case "totalMargin": value = (r.revenueMainWithMargin ?? 0) + (r.revenueOrderWithMargin ?? 0) - (r.revenueMainWithoutMargin ?? 0) - (r.revenueOrderWithoutMargin ?? 0); break;
        default: value = r.revenueMainWithMargin ?? 0;
      }
      values.push(Number(value.toFixed(2)));
    });

    // Call Prophet service
    const prophetRes = await fetch("https://sv-kassa-prophet.onrender.com/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates, values, periods }),
    });

    if (!prophetRes.ok) {
      const errorData = await prophetRes.json().catch(() => null);
      return NextResponse.json({ message: errorData?.message || "Prophet service failed" }, { status: prophetRes.status });
    }

    const forecastData = await prophetRes.json();
    return NextResponse.json(forecastData, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}
