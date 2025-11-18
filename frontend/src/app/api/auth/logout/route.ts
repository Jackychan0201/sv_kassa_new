// api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  const response = await apiRequest('/auth/logout', req, { method: 'POST' });
  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

  // Forward backend Set-Cookie header (clearing cookie) if exists
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('Set-Cookie', setCookie);
  }

  return res;
}
