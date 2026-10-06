import { AppShell } from "@/components/navigation/app-shell";
import { TagsManager } from "@/components/tags/tags-manager";
import type { Tag } from "@/lib/types";
import { apiFetch } from "@/lib/server-api";

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

export default async function TagsPage() {
  let tags: Tag[] = [];
  let error: string | null = null;

  try {
    tags = await getTags();
  } catch {
    error = "No fue posible cargar las etiquetas.";
  }

  return (
    <AppShell>
      <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-8 pb-24 lg:pb-12 max-w-6xl mx-auto">
        <header className="mb-8 border-b border-[#262626] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737373]">
            Organización
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Etiquetas
          </h1>
          <p className="mt-1 text-xs text-[#A3A3A3]">
            Clasifica momentos y clips clave para una edición y publicación más eficiente.
          </p>
        </header>

        <TagsManager initialTags={tags} initialError={error} />
      </main>
    </AppShell>
  );
}
