import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  const response = await apiRequest("/auth/logout", req, { method: "POST" });

  const res = new NextResponse(await response.text(), {
    status: response.status,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
