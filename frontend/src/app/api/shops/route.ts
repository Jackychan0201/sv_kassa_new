import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';

  const response = await fetch(`http://localhost:3000/shops`, {
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json({ message: errorData.message || 'Failed to fetch shops' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  const body = await req.json();

  const response = await fetch(`http://localhost:3000/shops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json({ message: errorData.message || 'Failed to create shop' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
