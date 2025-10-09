import { NextResponse } from "next/server";

export async function POST() {
  await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const res = NextResponse.json({ message: "Logged out" });
  
  res.cookies.set("Authentication", "", { path: "/", maxAge: 0 });

  return res;
}
