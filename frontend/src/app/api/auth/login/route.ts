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
    // The backend Set-Cookie may include Expires with commas, so don't split on commas.
    // Extract the Authentication cookie value and Max-Age using regex which is robust
    const authMatch = setCookie.match(/Authentication=([^;\s]+)/);
    if (authMatch) {
      const value = authMatch[1];

      const maxAgeMatch = setCookie.match(/Max-Age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 24 * 60 * 60;

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

      const cookieOptions: CookieOptions = {
        name: 'Authentication',
        value,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge,
      };

      // Use an explicit domain only if configured. Hardcoding '.vercel.app' can break
      // production deployments that don't use that domain.
      const configuredDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
      if (configuredDomain) cookieOptions.domain = configuredDomain;

      // Use typed overload to set cookie
      res.cookies.set(cookieOptions.name, cookieOptions.value, {
        path: cookieOptions.path,
        maxAge: cookieOptions.maxAge,
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        domain: cookieOptions.domain,
      });
    }
  }
  
  return res;
}