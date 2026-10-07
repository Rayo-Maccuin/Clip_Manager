import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await apiFetch("/usuarios", {
      method: "GET",
    });

    const body = await response.text();

    return new NextResponse(body, {
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

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await apiFetch("/usuarios", {
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