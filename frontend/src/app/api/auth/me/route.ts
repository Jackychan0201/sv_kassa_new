import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const res = await fetch("http://localhost:3000/auth/me", { headers: { cookie } });
  const data = await res.json();
  return NextResponse.json(data);
}
