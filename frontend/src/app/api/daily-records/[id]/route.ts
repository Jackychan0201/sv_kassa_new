import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const body = await req.json();
  const id = body.id;

  const response = await fetch(`http://localhost:3000/daily-records/${id}`, {
    method: "PATCH",
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
