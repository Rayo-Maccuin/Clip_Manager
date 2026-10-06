import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? "Credenciales inválidas" },
        { status: response.status },
      );
    }

    const token = data.token;
    const res = NextResponse.json({ user: data.user });

    if (token) {
      res.cookies.set("cm_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return res;
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el servidor de autenticación" },
      { status: 500 },
    );
  }
}
