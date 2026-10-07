import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.text();

    const response = await apiFetch(`/usuarios/${id}`, {
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
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el servidor." },
      { status: 500 },
    );
  }
}