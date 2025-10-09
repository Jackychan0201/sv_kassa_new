import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = await response.json();

  const res = NextResponse.json(data, { status: response.status });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const cookies = setCookie.split(";").map((c) => c.trim());
    const [cookieNameValue] = cookies;
    const [name, value] = cookieNameValue.split("=");

    res.cookies.set({
      name,
      value,
      httpOnly: true,
      path: "/",
    });
  }

  return res;
}
