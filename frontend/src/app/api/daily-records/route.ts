import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const path = fromDate && toDate
    ? `/daily-records/by-date?fromDate=${fromDate}&toDate=${toDate}`
    : "/daily-records";

  const response = await apiRequest(path, req);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const response = await apiRequest("/daily-records", req, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
