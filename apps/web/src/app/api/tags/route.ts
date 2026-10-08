import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server-api";

export async function GET() {
  const response = await apiFetch("/tags", {
    method: "GET",
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await apiFetch("/tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
