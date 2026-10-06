"use client";

import { useState, useSyncExternalStore, type SyntheticEvent } from "react";

type StreamPlayerProps = {
  url: string;
  title: string;
};

type EmbedInfo =
  | { type: "youtube"; embedUrl: string }
  | { type: "twitch-video"; embedUrl: string }
  | { type: "twitch-channel"; embedUrl: string }
  | { type: "kick-channel"; embedUrl: string }
  | { type: "direct-video"; url: string }
  | { type: "unsupported" };

function subscribeToHostname(onChange: () => void) {
  window.addEventListener("pageshow", onChange);
  return () => window.removeEventListener("pageshow", onChange);
}

function getHostnameSnapshot() {
  return window.location.hostname || "localhost";
}

function getHostnameServerSnapshot() {
  return "localhost";
}

export function parseStreamUrl(rawUrl: string, hostname: string): EmbedInfo {
  try {
    const cleanUrl = rawUrl.trim();
    if (!cleanUrl) return { type: "unsupported" };

    const url = new URL(
      cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
        ? cleanUrl
        : `https://${cleanUrl}`,
    );

    // YouTube embeds accept video IDs only, not arbitrary query values.
    if (
      url.hostname === "www.youtube.com" ||
      url.hostname === "youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        const v = url.searchParams.get("v");
        if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) {
          return {
            type: "youtube",
            embedUrl: `https://www.youtube-nocookie.com/embed/${v}?rel=0`,
          };
        }
      }
      if (url.pathname.startsWith("/live/")) {
        const id = url.pathname.split("/")[2];
        if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
          return {
            type: "youtube",
            embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
          };
        }
      }
      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/")[2];
        if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
          return {
            type: "youtube",
            embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
          };
        }
      }
    }

    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("?")[0];
      if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
        return {
          type: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        };
      }
    }

    // Twitch
    if (
      url.hostname === "www.twitch.tv" ||
      url.hostname === "twitch.tv" ||
      url.hostname === "m.twitch.tv"
    ) {
      const parentHost = hostname || "localhost";
      const parts = url.pathname.split("/").filter(Boolean);

      if (parts[0] === "videos" && parts[1]) {
        if (!/^\d+$/.test(parts[1])) return { type: "unsupported" };
        return {
          type: "twitch-video",
          embedUrl: `https://player.twitch.tv/?${new URLSearchParams({ video: parts[1], parent: parentHost, autoplay: "false" })}`,
        };
      }

      if (parts[0] && parts[0] !== "directory" && parts[0] !== "search") {
        if (!/^[A-Za-z0-9_]+$/.test(parts[0])) return { type: "unsupported" };
        return {
          type: "twitch-channel",
          embedUrl: `https://player.twitch.tv/?${new URLSearchParams({ channel: parts[0], parent: parentHost, autoplay: "false" })}`,
        };
      }
    }

    if (url.hostname === "kick.com" || url.hostname === "www.kick.com") {
      const channel = url.pathname.split("/").filter(Boolean)[0];
      if (channel && /^[A-Za-z0-9_]+$/.test(channel)) {
        return {
          type: "kick-channel",
          embedUrl: `https://player.kick.com/${encodeURIComponent(channel)}`,
        };
      }
    }

    // Direct video
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
      return { type: "direct-video", url: cleanUrl };
    }

    return { type: "unsupported" };
  } catch {
    return { type: "unsupported" };
  }
}

export function StreamPlayer({ url, title }: StreamPlayerProps) {
  const hostname = useSyncExternalStore(
    subscribeToHostname,
    getHostnameSnapshot,
    getHostnameServerSnapshot,
  );
  const [isMinimized, setIsMinimized] = useState(false);

  function restoreAudioPreference(event: SyntheticEvent<HTMLVideoElement>) {
    try {
      const preference = localStorage.getItem("clip-manager:stream-audio");
      if (!preference) return;
      const value = JSON.parse(preference) as { volume?: number; muted?: boolean };
      if (typeof value.volume === "number" && value.volume >= 0 && value.volume <= 1) {
        event.currentTarget.volume = value.volume;
      }
      if (typeof value.muted === "boolean") event.currentTarget.muted = value.muted;
    } catch {
      return;
    }
  }

  function storeAudioPreference(event: SyntheticEvent<HTMLVideoElement>) {
    try {
      localStorage.setItem("clip-manager:stream-audio", JSON.stringify({
        volume: event.currentTarget.volume,
        muted: event.currentTarget.muted,
      }));
    } catch {
      return;
    }
  }

  const embedInfo = parseStreamUrl(url, hostname);

  if (embedInfo.type === "unsupported") {
    return (
      <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
                Reproductor externo
              </p>
            </div>
            <p className="mt-1 text-sm text-[#F5F5F5]">
              El stream está alojado en una plataforma externa ({url}).
            </p>
            <p className="mt-0.5 text-xs text-[#737373]">
              Puedes abrirlo en una pestaña al lado mientras marcas momentos aquí en tiempo real.
            </p>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#262626] bg-[#171717] px-3.5 py-2 text-xs font-semibold text-[#F5F5F5] transition-colors hover:border-[#333333] hover:text-[#E50914]"
          >
            <span>Abrir en nueva pestaña</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A] shadow-xl">
      {/* Player header / bar */}
      <div className="flex items-center justify-between border-b border-[#262626] bg-[#111111] px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E50914]" />
          </span>
          <p className="truncate text-xs font-semibold text-[#F5F5F5]">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en pestaña externa"
            className="rounded p-1 text-[#737373] hover:text-[#F5F5F5] transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="rounded border border-[#262626] px-2 py-0.5 text-[10px] font-medium text-[#A3A3A3] hover:border-[#333333] hover:text-[#F5F5F5] transition-colors"
          >
            {isMinimized ? "Mostrar reproductor" : "Minimizar"}
          </button>
        </div>
      </div>

      {/* Video View */}
      {!isMinimized && (
        <div className="relative aspect-video w-full bg-black">
          {embedInfo.type === "youtube" ||
          embedInfo.type === "twitch-video" ||
          embedInfo.type === "twitch-channel" ||
          embedInfo.type === "kick-channel" ? (
            <iframe
              src={embedInfo.embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : embedInfo.type === "direct-video" ? (
            <video
              src={embedInfo.url}
              controls
              playsInline
              onLoadedMetadata={restoreAudioPreference}
              onVolumeChange={storeAudioPreference}
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : null}
        </div>
      )}
      <p className="border-t border-[#262626] px-4 py-2 text-[10px] text-[#737373]">
        Inicia la reproducción desde los controles del proveedor; algunos navegadores requieren interacción para activar el audio.
      </p>
    </div>
  );
}

