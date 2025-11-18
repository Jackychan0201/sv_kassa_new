import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  const response = await apiRequest("/auth/logout", req, {
    method: "POST"
  });
  
  const res = NextResponse.json({ message: "Logged out" });
  
  // Clear cookie with same attributes as set
  interface CookieOptions {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
    maxAge?: number;
    domain?: string;
  }

  const clearOptions: CookieOptions = {
    name: "Authentication",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV === 'production') {
    clearOptions.domain = '.vercel.app';
  }

  res.cookies.set(clearOptions as any);
  
  return res;
}