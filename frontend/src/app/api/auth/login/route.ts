import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await apiRequest("/auth/login", req, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const cookies = setCookie.split(";").map((c) => c.trim());
    const [cookieNameValue] = cookies;
    const [name, value] = cookieNameValue.split("=");
    res.cookies.set({ name, value, httpOnly: true, path: "/" });
  }

  return res;
}
