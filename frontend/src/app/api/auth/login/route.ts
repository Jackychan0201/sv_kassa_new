import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await apiRequest("/auth/login", req, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Pass through the backend Set-Cookie header as-is
  const res = new NextResponse(await response.text(), {
    status: response.status,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}

