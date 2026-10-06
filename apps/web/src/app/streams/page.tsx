import StreamsList from "./streams-list";
import NewStreamModal from "./new-stream-modal";
import { AppShell } from "@/components/navigation/app-shell";
import type { Stream } from "@/lib/types";
import { apiFetch } from "@/lib/server-api";

async function getStreams(): Promise<Stream[]> {
  const response = await apiFetch("/streams", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar los streams.");
  }

  return response.json() as Promise<Stream[]>;
}

export default async function StreamsPage() {
  let streams: Stream[] = [];
  let error: string | null = null;

  try {
    streams = await getStreams();
  } catch {
    error = "No fue posible cargar los streams. Intenta nuevamente.";
  }

  return (
    <AppShell>
      <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-8 pb-24 lg:pb-12 max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#262626] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Streams
            </h1>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Transmisiones registradas y compartidas entre el streamer y el equipo de moderación.
            </p>
          </div>

          <div>
            <NewStreamModal triggerLabel="Nuevo stream" />
          </div>
        </header>

        <StreamsList initialStreams={streams} initialError={error} />
      </main>
    </AppShell>
  );
}
