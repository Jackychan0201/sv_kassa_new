// api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  const timestamp = Date.now();
  const response = await apiRequest(`/auth/logout?t=${timestamp}`, req, { 
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    }
  });
  
  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

  // Forward backend Set-Cookie header (clearing cookie) if exists
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('Set-Cookie', setCookie);
  }

  // Add cache control headers to response
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');

  return res;
}