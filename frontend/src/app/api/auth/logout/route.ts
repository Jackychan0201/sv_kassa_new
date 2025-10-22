import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  await apiRequest("/auth/logout", req, { method: "POST" });

  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("Authentication", "", { path: "/", maxAge: 0 });

  return res;
}
