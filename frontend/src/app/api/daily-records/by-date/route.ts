import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { message: "fromDate and toDate are required" },
      { status: 400 }
    );
  }

  const response = await apiRequest(`/daily-records/by-date?fromDate=${fromDate}&toDate=${toDate}`, req);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
