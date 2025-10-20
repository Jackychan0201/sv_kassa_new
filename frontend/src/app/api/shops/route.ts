import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const response = await apiRequest("/shops", req);

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { message: errorData.message || "Failed to fetch shops" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await apiRequest("/shops", req, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { message: errorData.message || "Failed to create shop" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
