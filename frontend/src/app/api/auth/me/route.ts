// api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  const response = await apiRequest('/auth/me', req, { method: 'GET' });
  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

  // Forward Set-Cookie if any
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('Set-Cookie', setCookie);
  }

  return res;
}
