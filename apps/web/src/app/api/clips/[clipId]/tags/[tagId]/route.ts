import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{
    clipId: string;
    tagId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  const { clipId, tagId } = await context.params;

  const response = await apiFetch(`/clips/${clipId}/tags/${tagId}`, {
    method: "POST",
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
  const { clipId, tagId } = await context.params;

  const response = await apiFetch(`/clips/${clipId}/tags/${tagId}`, {
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
