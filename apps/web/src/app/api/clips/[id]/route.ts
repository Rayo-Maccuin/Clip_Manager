import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const body = await request.text();

  const response = await apiFetch(`/clips/${id}`, {
    method: "PATCH",
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

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  const response = await apiFetch(`/clips/${id}`, {
    method: "DELETE",
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
