import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const response = await apiRequest("/auth/me", req);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
