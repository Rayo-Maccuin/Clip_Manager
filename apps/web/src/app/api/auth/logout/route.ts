import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cm_access_token")?.value;

    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `cm_access_token=${token}`,
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("cm_access_token");
    return res;
  } catch {
    const res = NextResponse.json({ success: true });
    res.cookies.delete("cm_access_token");
    return res;
  }
}

