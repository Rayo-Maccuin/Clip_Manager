import { AppShell } from "@/components/navigation/app-shell";
import { HomeDashboard } from "@/components/dashboard/home-dashboard";
import type { Clip, Stream, Tag } from "@/lib/types";
import { apiFetch } from "@/lib/server-api";

async function getStreams(): Promise<Stream[]> {
  const response = await apiFetch("/streams", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar los streams.");
  }

  return response.json() as Promise<Stream[]>;
}

async function getClips(): Promise<Clip[]> {
  const response = await apiFetch("/clips", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar los clips.");
  }

  return response.json() as Promise<Clip[]>;
}

async function getTags(): Promise<Tag[]> {
  const response = await apiFetch("/tags", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<Tag[]>;
}

export default async function HomePage() {
  let streams: Stream[] = [];
  let clips: Clip[] = [];
  let tags: Tag[] = [];
  let error: string | null = null;

  try {
    [streams, clips, tags] = await Promise.all([getStreams(), getClips(), getTags()]);
  } catch {
    error = "No fue posible cargar la información del dashboard.";
  }

  return (
    <AppShell>
      <HomeDashboard
        initialStreams={streams}
        initialClips={clips}
        initialTags={tags}
        initialError={error}
      />
    </AppShell>
  );
}