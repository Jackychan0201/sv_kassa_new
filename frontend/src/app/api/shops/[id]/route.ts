import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const response = await apiRequest(`/shops/${id}`, req);

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  const response = await apiRequest(`/shops/${id}`, req, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const response = await apiRequest(`/shops/${id}`, req, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { message: errorData.message || "Failed to delete shop" },
      { status: response.status }
    );
  }

  return NextResponse.json({ message: `Shop ${id} deleted successfully` }, { status: 200 });
}
