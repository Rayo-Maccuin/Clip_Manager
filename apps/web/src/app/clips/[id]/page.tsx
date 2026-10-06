import { AppShell } from "@/components/navigation/app-shell";
import { ClipDetailPanel } from "@/components/clips/clip-detail-panel";
import { BackButton } from "@/components/navigation/back-button";
import type { Clip, Stream, Suggestion, Tag } from "@/lib/types";
import { apiFetch } from "@/lib/server-api";

async function getClip(clipId: string): Promise<Clip> {
  const response = await apiFetch(`/clips/${clipId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar el clip.");
  }

  return response.json() as Promise<Clip>;
}

async function getStream(streamId: string): Promise<Stream> {
  const response = await apiFetch(`/streams/${streamId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar el stream asociado.");
  }

  return response.json() as Promise<Stream>;
}

async function getTags(clipId: string): Promise<Tag[]> {
  const response = await apiFetch(`/clips/${clipId}/tags`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<Tag[]>;
}

async function getAllTags(): Promise<Tag[]> {
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

async function getSuggestions(clipId: string): Promise<Suggestion[]> {
  const response = await apiFetch(`/clips/${clipId}/suggestions`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<Suggestion[]>;
}

export default async function ClipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let clip: Clip | null = null;
  let stream: Stream | null = null;
  let tags: Tag[] = [];
  let allTags: Tag[] = [];
  let suggestions: Suggestion[] = [];
  let error: string | null = null;

  try {
    clip = await getClip(id);
    stream = await getStream(clip.streamId);
    [tags, allTags, suggestions] = await Promise.all([
      getTags(id),
      getAllTags(),
      getSuggestions(id),
    ]);
  } catch {
    error = "No fue posible cargar la información del clip.";
  }

  return (
    <AppShell>
      <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-8 max-w-6xl mx-auto">
        {clip && stream ? (
          <ClipDetailPanel
            clip={clip}
            stream={stream}
            allTags={allTags}
            initialTags={tags}
            initialSuggestions={suggestions}
            initialError={error}
          />
        ) : (
          <div className="space-y-4">
            <BackButton fallbackHref="/clips" label="Volver a Clips" />
            <section className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-8" role="alert">
              <p className="text-xs font-semibold text-[#EF4444]">
                {error ?? "No fue posible encontrar este clip."}
              </p>
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}
