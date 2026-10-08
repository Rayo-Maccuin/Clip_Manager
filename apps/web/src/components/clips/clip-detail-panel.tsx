"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  formatCompactDuration,
  formatStatusLabel,
  formatTimestamp,
  getAllStatuses,
  parseTimestamp,
} from "@/lib/format";
import type { Clip, Stream, Suggestion, Tag } from "@/lib/types";
import { BackButton } from "@/components/navigation/back-button";
import { WatchMomentButton } from "@/components/clips/watch-moment-button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { notifyToast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type Props = {
  clip: Clip;
  stream: Stream | null;
  allTags: Tag[];
  initialTags: Tag[];
  initialSuggestions: Suggestion[];
  initialError: string | null;
};

export function ClipDetailPanel({
  clip: initialClip,
  stream: initialStream,
  allTags,
  initialTags,
  initialSuggestions,
  initialError,
}: Props) {
  const router = useRouter();
  const [clip, setClip] = useState(initialClip);
  const [stream] = useState(initialStream);
  const [tags, setTags] = useState(initialTags);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [availableTags, setAvailableTags] = useState<Tag[]>(
    allTags.filter((tag) => !initialTags.some((current) => current.id === tag.id)),
  );
  const [selectedTagId, setSelectedTagId] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(clip.title);
  const [editDescription, setEditDescription] = useState(clip.description ?? "");
  const [editStartTime, setEditStartTime] = useState(formatTimestamp(clip.timestamp));
  const [editEndTime, setEditEndTime] = useState(formatTimestamp(clip.timestamp + clip.duration));
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingClip, setIsDeletingClip] = useState(false);
  const [error] = useState(initialError);

  const allStatuses = useMemo(() => getAllStatuses(), []);

  const editRangeDuration = useMemo(() => {
    const start = parseTimestamp(editStartTime);
    const end = parseTimestamp(editEndTime);
    return start !== null && end !== null ? end - start : null;
  }, [editEndTime, editStartTime]);

  const handleStatusChange = async (nextStatus: string) => {
    if (nextStatus === clip.status) {
      return;
    }

    setIsSavingStatus(true);
    setStatusError(null);

    try {
      const response = await fetch(`/api/clips/${clip.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("No fue posible actualizar el estado.");
      }

      const updatedClip = (await response.json()) as Clip;
      setClip(updatedClip);
      notifyToast("Estado actualizado.");
    } catch {
      setStatusError("No fue posible actualizar el estado del clip.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  async function handleSaveEdit() {
    const cleanTitle = editTitle.trim();

    if (!cleanTitle) {
      setEditError("Introduce un título para el clip.");
      return;
    }

    const timestamp = parseTimestamp(editStartTime);
    const endTimestamp = parseTimestamp(editEndTime);
    if (timestamp === null || endTimestamp === null) {
      setEditError("Introduce inicio y fin válidos en formato HH:MM:SS.");
      return;
    }
    const duration = endTimestamp - timestamp;
    if (!Number.isSafeInteger(duration) || duration <= 0) {
      setEditError("El fin del clip debe ser posterior al inicio.");
      return;
    }

    // Only re-validate the range against the stream length when the user actually
    // moved it, so editing just the title can never be blocked by stale bounds.
    const isRangeUnchanged = timestamp === clip.timestamp && duration === clip.duration;
    if (!isRangeUnchanged && stream) {
      const streamEnd = stream.endedAt ? new Date(stream.endedAt).getTime() : Date.now();
      const streamDuration = Math.max(0, Math.floor((streamEnd - new Date(stream.startedAt).getTime()) / 1000));
      if (endTimestamp > streamDuration) {
        setEditError("El rango del clip no puede superar la duración del stream.");
        return;
      }
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          description: editDescription.trim(),
          timestamp,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible guardar los cambios.");
      }

      const updatedClip = (await response.json()) as Clip;
      setClip(updatedClip);
      const suggestionResponse = await fetch(`/api/clips/${clip.id}/suggestions`, {
        credentials: "include",
        cache: "no-store",
      });
      if (suggestionResponse.ok) {
        setSuggestions((await suggestionResponse.json()) as Suggestion[]);
      }
      setIsEditing(false);
      notifyToast("Clip actualizado correctamente.");
    } catch {
      setEditError("No fue posible guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteClip() {
    setIsDeletingClip(true);

    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No fue posible eliminar el clip.");
      }

      notifyToast("Clip eliminado.");
      router.push("/clips");
    } catch {
      setIsDeletingClip(false);
      setShowDeleteConfirm(false);
      notifyToast("No fue posible eliminar el clip.", "error");
    }
  }

  const handleAddTag = async (tagIdToAdd?: string, newlyCreatedTag?: Tag) => {
    const tagId = tagIdToAdd ?? selectedTagId;

    if (!tagId) {
      setTagError("Selecciona una etiqueta para añadir.");
      return;
    }

    setIsAddingTag(true);
    setTagError(null);

    try {
      const response = await fetch(`/api/clips/${clip.id}/tags/${tagId}`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("No fue posible vincular la etiqueta.");
      }

      const addedTag = newlyCreatedTag ?? availableTags.find((tag) => tag.id === tagId);
      if (addedTag) {
        setTags((current) => [...current, addedTag]);
        setAvailableTags((current) => current.filter((tag) => tag.id !== tagId));
        notifyToast("Etiqueta agregada al clip.");
      }
      setSelectedTagId("");
    } catch {
      setTagError("No fue posible vincular la etiqueta al clip.");
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleCreateAndAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTagName.trim();
    if (!cleanName) {
      setTagError("Escribe un nombre para la etiqueta.");
      return;
    }

    setIsCreatingTag(true);
    setTagError(null);

    try {
      const response = await fetch(`/api/tags`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanName }),
      });

      if (!response.ok) {
        throw new Error("No fue posible crear la etiqueta.");
      }

      const createdTag = (await response.json()) as Tag;
      setAvailableTags((current) => current.some((tag) => tag.id === createdTag.id) ? current : [...current, createdTag]);
      await handleAddTag(createdTag.id, createdTag);
      setNewTagName("");
    } catch (caughtError) {
      setTagError(
        caughtError instanceof Error ? caughtError.message : "Error al crear la etiqueta.",
      );
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/clips/${clip.id}/tags/${tagId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("No fue posible remover la etiqueta.");
      }

      const removedTag = tags.find((tag) => tag.id === tagId);
      setTags((current) => current.filter((tag) => tag.id !== tagId));
      if (removedTag) {
        setAvailableTags((current) => [...current, removedTag]);
      }
      notifyToast("Etiqueta quitada del clip.");
    } catch {
      setTagError("No fue posible eliminar la etiqueta.");
    }
  };

  if (error || !stream) {
  return (
      <div className="space-y-4">
        <BackButton fallbackHref="/clips" label="Volver a Clips" />
        <div className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-6 text-sm text-[#EF4444]" role="alert">
          {error ?? "No fue posible encontrar este clip."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Back button */}
      <div>
        <BackButton fallbackHref="/clips" label="Volver a Clips" />
      </div>

      {/* Main Grid: Left is Editorial Sheet (8 cols), Right is Status & Metadata (4 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Editorial Details */}
        <section className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E50914]">
                  Ficha Editorial del Clip
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  {isEditing ? editTitle : clip.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={clip.status} className="px-3 py-1 text-xs" />
                <WatchMomentButton clip={clip} vodUrl={stream.vodUrl} />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditTitle(clip.title);
                    setEditDescription(clip.description ?? "");
                    setEditStartTime(formatTimestamp(clip.timestamp));
                    setEditEndTime(formatTimestamp(clip.timestamp + clip.duration));
                    setIsEditing(!isEditing);
                    setEditError(null);
                  }}
                  title={isEditing ? "Cancelar edición" : "Editar clip"}
                  aria-label={isEditing ? "Cancelar edición" : "Editar clip"}
                  icon={
                    isEditing ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-4.5-10.5L17 7l-7 7v4l-4 0 1-4z" />
                      </svg>
                    )
                  }
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="cm-field">
                    <label htmlFor="clip-start-time" className="cm-field__label">
                      Inicio
                    </label>
                    <input
                      id="clip-start-time"
                      type="text"
                      inputMode="numeric"
                      value={editStartTime}
                      onChange={(event) => setEditStartTime(event.target.value)}
                      disabled={isSavingEdit}
                      placeholder="00:18:42"
                      aria-describedby="clip-range-hint"
                      className="cm-input cm-input--mono"
                    />
                  </div>
                  <div className="cm-field">
                    <label htmlFor="clip-end-time" className="cm-field__label">
                      Fin
                    </label>
                    <input
                      id="clip-end-time"
                      type="text"
                      inputMode="numeric"
                      value={editEndTime}
                      onChange={(event) => setEditEndTime(event.target.value)}
                      disabled={isSavingEdit}
                      placeholder="00:19:15"
                      aria-describedby="clip-range-hint"
                      className="cm-input cm-input--mono"
                    />
                  </div>
                </div>
                <p id="clip-range-hint" className="cm-field__hint">
                  {editRangeDuration !== null && editRangeDuration > 0 ? (
                    <>
                      Duración calculada{" "}
                      <span className="font-mono font-semibold text-[#A3A3A3]">
                        {formatTimestamp(editRangeDuration)}
                      </span>{" "}
                      ({formatCompactDuration(editRangeDuration)}). Si sólo cambias el título, el rango se conserva.
                    </>
                  ) : (
                    "Introduce un fin posterior al inicio para calcular la duración."
                  )}
                </p>
                <div className="cm-field">
                  <label htmlFor="clip-title" className="cm-field__label">
                    Título
                  </label>
                  <input
                    id="clip-title"
                    type="text"
                    maxLength={200}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={isSavingEdit}
                    className="cm-input"
                  />
                </div>
                <div className="cm-field">
                  <label htmlFor="clip-desc" className="cm-field__label">
                    Descripción
                  </label>
                  <textarea
                    id="clip-desc"
                    rows={3}
                    maxLength={2000}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={isSavingEdit}
                    placeholder="Contexto adicional sobre este momento..."
                    className="cm-input resize-none"
                  />
                </div>

                {editError && <p role="alert" className="cm-field__error">{editError}</p>}

                <div className="cm-modal__footer">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSavingEdit}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => void handleSaveEdit()}
                    disabled={!editTitle.trim()}
                    isLoading={isSavingEdit}
                    loadingLabel="Guardando..."
                  >
                    Guardar cambios
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Timeline: Inicio / Fin / Duracion */}
                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-xl border border-[#242424] bg-[#111111] p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                      Inicio
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-[#E50914]">
                      {formatTimestamp(clip.timestamp)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#111111] p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                      Fin
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-[#E50914]">
                      {formatTimestamp(clip.timestamp + clip.duration)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#111111] p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                      Duración
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-white">
                      {formatTimestamp(clip.duration)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#737373]">
                      {formatCompactDuration(clip.duration)}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border border-[#242424] bg-[#111111] p-3.5 lg:col-span-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                      Stream origen
                    </p>
                    <Link
                      href={`/streams/${stream.id}`}
                      className="mt-1 block truncate text-xs font-semibold text-[#F5F5F5] hover:text-[#E50914] transition-colors"
                    >
                      {stream.title}
                    </Link>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 border-t border-[#262626] pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                    Descripción o contexto
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#D4D4D4]">
                    {clip.description || "Sin descripción proporcionada al momento de la captura."}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Tags Management Card */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-[#F5F5F5]">
                  Etiquetas del momento
                </h2>
                <p className="text-xs text-[#737373]">
                  Facilitan la búsqueda y la organización para el equipo de edición.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeletingClip}
                className="rounded-lg border border-[#262626] bg-[#111111] p-1.5 text-[#737373] transition-colors hover:border-[#EF4444] hover:text-[#EF4444] focus:outline-none focus:ring-1 focus:ring-[#E50914] disabled:opacity-50"
                title="Eliminar clip"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Attached Tags */}
            <div className="mt-4">
              {tags.length === 0 ? (
                <p className="text-xs text-[#737373] italic">No hay etiquetas vinculadas a este clip.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#111111] px-3 py-1 text-xs font-semibold text-[#F5F5F5]"
                    >
                      <span>{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => void handleRemoveTag(tag.id)}
                        className="text-[#737373] hover:text-[#EF4444] transition-colors p-0.5"
                        title={`Quitar etiqueta ${tag.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {tagError && (
              <div className="mt-3 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-2.5 text-xs text-[#EF4444]">
                {tagError}
              </div>
            )}

            {/* Add existing tag / Create new tag */}
            <div className="mt-6 border-t border-[#262626] pt-5 space-y-4">
              {availableTags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#A3A3A3] mb-2">
                    Añadir etiqueta existente:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => void handleAddTag(tag.id)}
                        disabled={isAddingTag}
                        className="rounded-lg border border-[#262626] bg-[#111111] px-2.5 py-1 text-xs font-medium text-[#A3A3A3] transition-colors hover:border-[#E50914] hover:text-white"
                      >
                        + {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create new tag inline */}
              <form onSubmit={(e) => void handleCreateAndAddTag(e)} className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Crear nueva etiqueta y agregar..."
                  disabled={isCreatingTag}
                  className="flex-1 rounded-lg border border-[#262626] bg-[#111111] px-3 py-2 text-xs text-[#F5F5F5] outline-none placeholder:text-[#737373] focus:border-[#E50914]"
                />
                <button
                  type="submit"
                  disabled={isCreatingTag || !newTagName.trim()}
                  className="rounded-lg bg-[#E50914] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#FF1F2D] disabled:opacity-50"
                >
                  {isCreatingTag ? "Añadiendo..." : "Añadir"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Right Column: State Management & Suggestions (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Status Management Card */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6">
            <h2 className="text-sm font-bold tracking-tight text-[#F5F5F5]">
              Gestión de Estado
            </h2>
            <p className="mt-1 text-xs text-[#737373]">
              Selecciona el estado actual del clip según el flujo de trabajo del equipo.
            </p>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">Estado del clip</label>
              <DropdownSelect
                label="Estado del clip"
                value={clip.status}
                onChange={(nextStatus) => void handleStatusChange(nextStatus)}
                disabled={isSavingStatus}
                options={allStatuses.map((status) => ({ value: status, label: formatStatusLabel(status) }))}
                compact
              />
              {isSavingStatus && <p className="mt-2 text-[11px] text-[#737373]" role="status">Actualizando estado...</p>}
            </div>

            {statusError && (
              <div className="mt-3 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-2.5 text-xs text-[#EF4444]">
                {statusError}
              </div>
            )}
          </div>

           {/* Suggestions Card */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6">
            <h2 className="text-sm font-bold tracking-tight text-[#F5F5F5]">
              Sugerencias de Distribución
            </h2>
            <p className="mt-1 text-xs text-[#737373]">
              Acciones sugeridas según la duración del stream y del clip.
            </p>

            <div className="mt-4 space-y-2.5">
              {suggestions.length === 0 ? (
                <div className="rounded-xl border border-[#262626] bg-[#111111] p-4 text-xs text-[#737373]">
                  No hay sugerencias para este clip.
                </div>
              ) : (
                suggestions.map((suggestion, index) => {
                  const isStreamAction = suggestion.platform === 'KICK';
                  return (
                    <div
                      key={index}
                      className={`rounded-xl border p-3.5 space-y-1.5 ${
                        isStreamAction
                          ? 'border-[#E50914]/30 bg-[#E50914]/5'
                          : 'border-[#262626] bg-[#111111]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isStreamAction ? 'text-[#E50914]' : 'text-white'}`}>
                          {suggestion.action}
                        </span>
                        {!isStreamAction && (
                          <span className="rounded bg-[#171717] px-2 py-0.5 text-[10px] text-[#A3A3A3] font-mono">
                            {suggestion.format}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#737373] leading-relaxed">
                        {suggestion.reason}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDeleteClip()}
        title="¿Eliminar este clip?"
        message="Esta acción eliminará el clip guardado, pero no afectará el VOD original ni el stream."
        confirmLabel="Eliminar clip"
        isConfirming={isDeletingClip}
        destructive
      />
    </div>
  );
}
