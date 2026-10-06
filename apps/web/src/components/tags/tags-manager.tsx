"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { notifyToast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export function TagsManager({
  initialTags,
  initialError,
}: {
  initialTags: Tag[];
  initialError: string | null;
}) {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState(initialError);
  const [isRetrying, setIsRetrying] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  async function handleRetry() {
    setIsRetrying(true);
    try {
      const response = await fetch(`${API_URL}/tags`, { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error();
      setTags((await response.json()) as Tag[]);
      setError(null);
    } catch {
      setError("No fue posible cargar las etiquetas. Intenta nuevamente.");
    } finally {
      setIsRetrying(false);
    }
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Escribe el nombre de la etiqueta.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/tags`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanName }),
      });

      if (!response.ok) {
        if (response.status === 409 || response.status === 400) {
          throw new Error("Ya existe una etiqueta con ese nombre.");
        }
        throw new Error("No fue posible crear la etiqueta.");
      }

      const createdTag = (await response.json()) as Tag;
      setTags((current) => [...current, createdTag]);
      setName("");
      notifyToast("Etiqueta creada correctamente.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "No fue posible crear la etiqueta.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (tag: Tag) => {
    setTagToDelete(tag);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;

    setDeletingId(tagToDelete.id);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/tags/${tagToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("No fue posible eliminar la etiqueta.");
      }

      setTags((current) => current.filter((t) => t.id !== tagToDelete.id));
      notifyToast("Etiqueta eliminada.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Error al eliminar la etiqueta.",
      );
    } finally {
      setDeletingId(null);
      setTagToDelete(null);
    }
  };

  if (error && tags.length === 0) {
    return (
      <section className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-6 sm:p-8" role="alert">
        <p className="text-xs font-semibold text-[#EF4444]">{error}</p>
        <button
          type="button"
          onClick={() => void handleRetry()}
          disabled={isRetrying}
          className="mt-4 rounded-lg border border-[#262626] bg-[#111111] px-4 py-2 text-xs font-medium text-[#F5F5F5] hover:border-[#333333] hover:bg-[#171717] disabled:opacity-50"
        >
          {isRetrying ? "Reintentando..." : "Reintentar"}
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Create Tag Bar */}
      <form
        onSubmit={(e) => void handleCreate(e)}
        className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 sm:p-6"
      >
        <p className="cm-field__label">Nueva etiqueta</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
            placeholder="Ej. Speedrun, EasterEgg, Fail..."
            aria-label="Nombre de la nueva etiqueta"
            className="cm-input flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isCreating}
            loadingLabel="Creando..."
            disabled={!name.trim()}
          >
            Crear etiqueta
          </Button>
        </div>

        {error && (
          <p className="cm-field__error mt-3" role="alert">
            {error}
          </p>
        )}
      </form>

      {/* Tags Grid */}
      <section>
        <p className="mb-4 text-[11px] text-[#737373]">
          {tags.length} {tags.length === 1 ? "etiqueta registrada" : "etiquetas registradas"}
        </p>

        {tags.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#242424] bg-[#0D0D0D] p-12 text-center">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-[#242424] bg-[#111111] text-[#525252]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#D4D4D4]">Todavía no hay etiquetas</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-[#737373]">
              Crea etiquetas para clasificar los momentos y encontrarlos rápido durante la edición.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center justify-between gap-2 rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 transition-all duration-200 hover:border-[#303030] hover:bg-[#111111]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#F5F5F5] transition-colors group-hover:text-white">
                    {tag.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-[#737373]">
                    {tag.usageCount ?? 0} {tag.usageCount === 1 ? "uso" : "usos"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(tag)}
                  disabled={deletingId === tag.id}
                  title={`Eliminar etiqueta ${tag.name}`}
                  aria-label={`Eliminar etiqueta ${tag.name}`}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-transparent text-[#737373] transition-colors hover:border-[#7F1D1D] hover:bg-[#EF4444]/10 hover:text-[#F87171] focus:outline-none disabled:opacity-50"
                >
                  {deletingId === tag.id ? (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={tagToDelete !== null}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => confirmDelete()}
        title="Eliminar etiqueta"
        message={`¿Estás seguro de eliminar la etiqueta "${tagToDelete?.name}"? Se desvinculará de los clips asociados.`}
        confirmLabel="Eliminar etiqueta"
        isConfirming={deletingId !== null}
        destructive
      />
    </div>
  );
}
