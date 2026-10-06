import { AppShell } from "@/components/navigation/app-shell";
import { ClipsLibrary } from "@/components/clips/clips-library";
import type { Clip, Stream, Tag } from "@/lib/types";
import { apiFetch } from "@/lib/server-api";

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

async function getTags(): Promise<Tag[]> {
  const response = await apiFetch("/tags", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar las etiquetas.");
  }

  return response.json() as Promise<Tag[]>;
}

export default async function ClipsPage() {
  let clips: Clip[] = [];
  let streams: Stream[] = [];
  let tags: Tag[] = [];
  let error: string | null = null;

  try {
    [clips, streams, tags] = await Promise.all([getClips(), getStreams(), getTags()]);
  } catch {
    error = "No fue posible cargar la biblioteca de clips.";
  }

  return (
    <AppShell>
      <main className="min-h-screen pb-20 lg:pb-8">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">Biblioteca</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Clips
            </h1>
            <p className="mt-1.5 text-xs text-[#A3A3A3]">
              Explora todos los clips, filtra por estado, stream y etiqueta, y salta al momento exacto en el VOD.
            </p>
          </header>

          <ClipsLibrary
            initialClips={clips}
            initialStreams={streams}
            initialTags={tags}
            initialError={error}
          />
        </div>
      </main>
    </AppShell>
  );
}
