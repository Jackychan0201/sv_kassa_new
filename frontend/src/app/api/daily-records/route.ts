import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const url = fromDate && toDate
    ? `http://localhost:3000/daily-records/by-date?fromDate=${fromDate}&toDate=${toDate}`
    : `http://localhost:3000/daily-records`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    credentials: "include",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const body = await req.json();

  const response = await fetch("http://localhost:3000/daily-records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}