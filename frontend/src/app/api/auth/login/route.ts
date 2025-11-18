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
    // Parse the Set-Cookie header properly - handle multiple cookies
    const cookies = setCookie.split(',').map(c => c.trim());
    
    for (const cookie of cookies) {
      const [nameValue, ...attributes] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      
      if (name === 'Authentication') {
        // Extract maxAge from attributes if present
        let maxAge = 24 * 60 * 60; // Default 24 hours
        const maxAgeAttr = attributes.find(attr => attr.trim().startsWith('Max-Age'));
        if (maxAgeAttr) {
          maxAge = parseInt(maxAgeAttr.split('=')[1]);
        }
        
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
          name,
          value,
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: maxAge,
        };
        
        // Add domain in production
        if (process.env.NODE_ENV === 'production') {
          cookieOptions.domain = '.vercel.app';
        }
        
        res.cookies.set(cookieOptions);
      }
    }
  }
  
  return res;
}