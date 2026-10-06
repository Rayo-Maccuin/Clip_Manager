import StreamDetail from "./stream-detail";
import type { Clip, Stream, Tag } from "@/lib/types";
import { apiFetch } from "@/lib/server-api";
import { AppShell } from "@/components/navigation/app-shell";

type StreamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getStream(id: string): Promise<Stream> {
  const response = await apiFetch(`/streams/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar el stream.");
  }

  return response.json() as Promise<Stream>;
}

async function getClips(streamId: string): Promise<Clip[]> {
  const response = await apiFetch(`/streams/${streamId}/clips`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
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
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return [];
  return response.json() as Promise<Tag[]>;
}

export default async function StreamPage({ params }: StreamPageProps) {
  const { id } = await params;

  let stream: Stream | null = null;
  let clips: Clip[] = [];
  let tags: Tag[] = [];
  let error: string | null = null;

  try {
    [stream, clips, tags] = await Promise.all([
      getStream(id),
      getClips(id),
      getTags(),
    ]);
  } catch {
    error = "No fue posible cargar la información del stream. Intenta nuevamente.";
  }

  return (
    <AppShell>
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          <StreamDetail
            stream={stream}
            clips={clips}
            tags={tags}
            initialError={error}
          />
        </div>
      </main>
    </AppShell>
  );
}