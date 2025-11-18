import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  const response = await apiRequest("/auth/logout", req, {
    method: "POST"
  });
  
  const res = NextResponse.json({ message: "Logged out" });
  
  // Clear cookie with same attributes as set
  const clearOptions: any = {
    name: "Authentication",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const
  };
  
  if (process.env.NODE_ENV === 'production') {
    clearOptions.domain = '.vercel.app';
  }
  
  res.cookies.set(clearOptions);
  
  return res;
}