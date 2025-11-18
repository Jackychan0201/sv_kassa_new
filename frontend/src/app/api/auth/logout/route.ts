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
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  // Use the same domain logic as login route: only set explicit domain if configured
  const configuredDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  if (configuredDomain) clearOptions.domain = configuredDomain;

  // Use the cookie setter overload (name, value, options) to avoid 'any' typing
  // Clear cookie for configured domain (if any) and for host-scoped cookie as a fallback.
  // Some browsers may have both a domain-scoped and a host-scoped cookie with the same name.
  type CookieSetOptions = {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    domain?: string;
  };

  const cookieOptionsForSet: CookieSetOptions = {
    path: clearOptions.path,
    maxAge: clearOptions.maxAge,
    httpOnly: clearOptions.httpOnly,
    secure: clearOptions.secure,
    sameSite: clearOptions.sameSite,
  };

  // If a configured domain exists, clear the domain-scoped cookie first
  if (clearOptions.domain) {
    res.cookies.set(clearOptions.name, clearOptions.value, {
      ...cookieOptionsForSet,
      domain: clearOptions.domain,
    });
  }

  // Also clear the host-scoped cookie (no domain) to ensure removal
  res.cookies.set(clearOptions.name, clearOptions.value, cookieOptionsForSet);
  
  return res;
}