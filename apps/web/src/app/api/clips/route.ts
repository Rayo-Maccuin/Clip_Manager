import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/server-api";

export async function GET() {
  const response = await apiFetch("/clips", {
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
