"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatStatusLabel } from "@/lib/format";
import type { Clip, Stream, Tag } from "@/lib/types";
import { ClipTimeRange } from "@/components/clips/clip-time-range";
import { WatchMomentButton } from "@/components/clips/watch-moment-button";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { StatusBadge } from "@/components/ui/status-badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export function ClipsLibrary({
  initialClips,
  initialStreams,
  initialTags,
  initialError,
}: {
  initialClips: Clip[];
  initialStreams: Stream[];
  initialTags: Tag[];
  initialError: string | null;
}) {
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [streams] = useState(initialStreams);
  const [tags] = useState(initialTags);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [streamFilter, setStreamFilter] = useState("ALL");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState(initialError);
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/clips`, { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error();
      setClips((await response.json()) as Clip[]);
      setError(null);
    } catch {
      setError("No fue posible cargar los clips. Intenta nuevamente.");
    } finally {
      setIsRetrying(false);
    }
  }

  const streamMap = useMemo(
    () => new Map(streams.map((stream) => [stream.id, stream])),
    [streams],
  );

  const filteredClips = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = clips.filter((clip) => {
      const matchesSearch =
        query.length === 0 ||
        clip.title.toLowerCase().includes(query) ||
        (clip.description && clip.description.toLowerCase().includes(query));

      const matchesStatus = statusFilter === "ALL" || clip.status === statusFilter;
      const matchesStream = streamFilter === "ALL" || clip.streamId === streamFilter;
      const matchesTag =
        tagFilter === "ALL" || (clip.tags && clip.tags.some((t) => t.id === tagFilter));

      return matchesSearch && matchesStatus && matchesStream && matchesTag;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "duration":
          return b.duration - a.duration;
        case "timestamp":
          return b.timestamp - a.timestamp;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [clips, search, sortBy, statusFilter, streamFilter, tagFilter]);

  if (error) {
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
    <section className="space-y-6">
      {/* Filters Bar */}
      <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
              Buscar momento
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ej. clutch, risas, bug..."
              className="w-full rounded-lg border border-[#262626] bg-[#111111] px-3 py-2 text-xs text-[#F5F5F5] outline-none placeholder:text-[#737373] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
              Estado
            </label>
            <DropdownSelect
              label="Filtrar por estado"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "ALL", label: "Todos los estados" },
                ...["PENDING", "IN_REVIEW", "SELECTED", "EDITED", "PUBLISHED", "DISCARDED"].map((status) => ({ value: status, label: formatStatusLabel(status) })),
              ]}
              compact
            />
          </div>

          {/* Stream */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
              Stream
            </label>
            <DropdownSelect
              label="Filtrar por stream"
              value={streamFilter}
              onChange={setStreamFilter}
              options={[{ value: "ALL", label: "Todos los streams" }, ...streams.map((stream) => ({ value: stream.id, label: stream.title }))]}
              compact
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
              Etiqueta
            </label>
            <DropdownSelect
              label="Filtrar por etiqueta"
              value={tagFilter}
              onChange={setTagFilter}
              options={[{ value: "ALL", label: "Todas las etiquetas" }, ...tags.map((tag) => ({ value: tag.id, label: tag.name }))]}
              compact
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
              Ordenar por
            </label>
            <DropdownSelect
              label="Ordenar clips"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "newest", label: "Más recientes" },
                { value: "oldest", label: "Más antiguos" },
                { value: "duration", label: "Mayor duración" },
                { value: "timestamp", label: "Timestamp" },
              ]}
              compact
            />
          </div>
        </div>
      </div>

      {/* Clips counter info */}
      <div className="flex items-center justify-between text-xs text-[#737373]">
        <p>
          {filteredClips.length} {filteredClips.length === 1 ? "clip encontrado" : "clips encontrados"}
        </p>
      </div>

      {/* Empty State */}
      {filteredClips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#242424] bg-[#0D0D0D] p-12 text-center">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-[#242424] bg-[#111111] text-[#525252]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[#D4D4D4]">
            {clips.length === 0 ? "Todavía no hay clips" : "Ningún clip coincide con los filtros"}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-[#737373]">
            {clips.length === 0
              ? "Los momentos aparecen aquí al marcarlos desde Inicio o desde el detalle de un stream en vivo."
              : "Prueba con otro término de búsqueda o restablece los filtros para ver todos los clips."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClips.map((clip) => {
            const stream = streamMap.get(clip.streamId);
            return (
              <article
                key={clip.id}
                className="group flex flex-col rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 transition-all duration-200 hover:border-[#303030] hover:bg-[#111111]"
              >
                <div className="flex items-start justify-between gap-2">
                  <ClipTimeRange timestamp={clip.timestamp} duration={clip.duration} />
                  <StatusBadge status={clip.status} />
                </div>

                <Link
                  href={`/clips/${clip.id}`}
                  className="mt-3 text-sm font-semibold text-[#F5F5F5] leading-snug line-clamp-2 transition-colors group-hover:text-white"
                >
                  {clip.title}
                </Link>

                {clip.description && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#737373] line-clamp-2">
                    {clip.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  {clip.tags && clip.tags.length > 0 ? (
                    clip.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded border border-[#242424] bg-[#151515] px-1.5 py-0.5 text-[10px] font-medium text-[#A3A3A3]"
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#525252]">Sin etiquetas</span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#242424] pt-3">
                  <Link
                    href={stream ? `/streams/${stream.id}` : "/streams"}
                    className="min-w-0 truncate text-[11px] text-[#737373] transition-colors hover:text-[#E50914]"
                  >
                    {stream?.title ?? "Stream"}
                  </Link>
                  {stream && <WatchMomentButton clip={clip} vodUrl={stream.vodUrl} />}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
