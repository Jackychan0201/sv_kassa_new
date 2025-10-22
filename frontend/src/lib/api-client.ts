import { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function apiRequest(
  path: string,
  req: NextRequest,
  options: RequestInit = {}
): Promise<Response> {
  const cookie = req.headers.get("cookie") ?? "";

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      cookie,
      ...options.headers,
    },
  });
}
