import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id;

  const response = await apiRequest(`/daily-records/${id}`, req, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
