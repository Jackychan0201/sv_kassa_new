import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { message: "fromDate and toDate are required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `http://localhost:3000/daily-records/by-date?fromDate=${fromDate}&toDate=${toDate}`,
    {
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      credentials: "include",
    }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
