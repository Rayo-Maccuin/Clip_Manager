import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("cm_access_token")?.value;
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Cookie", `cm_access_token=${token}`);
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
