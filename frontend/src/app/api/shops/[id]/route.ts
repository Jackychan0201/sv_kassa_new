import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cookie = req.headers.get("cookie") ?? "";

  const response = await fetch(`http://localhost:3000/shops/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cookie = req.headers.get("cookie") ?? "";
  const body = await req.json();

  const response = await fetch(`http://localhost:3000/shops/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const cookies = setCookie.split(";").map((c) => c.trim());
    const [cookieNameValue] = cookies;
    const [name, value] = cookieNameValue.split("=");

    res.cookies.set({
      name,
      value,
      httpOnly: true,
      path: "/",
    });
  }

  return res;
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const cookie = req.headers.get("cookie") ?? "";
  const { id } = await params;

  const response = await fetch(`http://localhost:3000/shops/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", cookie },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json({ message: errorData.message || "Failed to delete shop" }, { status: response.status });
  }

  return NextResponse.json({ message: `Shop ${id} deleted successfully` }, { status: 200 });
}