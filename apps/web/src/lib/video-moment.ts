import type { Clip } from "@/lib/types";

export type VideoMomentTarget = {
  url: string;
  action: "seek" | "open";
  label: "Ver momento" | "Abrir VOD";
  /** True when the platform can honour the clip start, not just open the page. */
  seeksToStart: boolean;
  /** True when the player can also honour the clip end. */
  seeksToEnd: boolean;
  explanation?: string;
};

function getYouTubeId(url: URL): string | null {
  let id: string | null = null;
  if (url.hostname === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else id = url.pathname.split("/").filter(Boolean).at(-1) ?? null;
  }

  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

function formatTwitchTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h${minutes}m${seconds}s`;
}

/**
 * Kick VOD pages are `https://kick.com/{channel}/videos/{uuid}`.
 * The player reads `?t=` (whole seconds) and calls `seekTo()` + `play()` on its
 * IVS player instance, and Kick's own share button emits exactly this parameter.
 * Verified against the live VOD route; `#t=` and `?start=` are ignored by the page.
 */
function getKickVod(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const videosIndex = parts.indexOf("videos");
  if (videosIndex > 0 && parts.length > videosIndex + 1) {
    return { channel: parts[videosIndex - 1], uuid: parts[videosIndex + 1] };
  }
  return null;
}

function isKickHost(url: URL) {
  return url.hostname === "kick.com" || url.hostname.endsWith(".kick.com");
}

export function buildVideoMomentTarget(
  vodUrl: string,
  clip: Pick<Clip, "timestamp" | "duration">,
  parentHost: string,
): VideoMomentTarget {
  const start = Math.max(0, Math.floor(clip.timestamp));
  const end = start + Math.max(1, Math.floor(clip.duration));

  try {
    const url = new URL(
      vodUrl.startsWith("http://") || vodUrl.startsWith("https://") ? vodUrl : `https://${vodUrl}`,
    );
    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
      const params = new URLSearchParams({ start: String(start), end: String(end), rel: "0" });
      return {
        url: `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`,
        action: "seek",
        label: "Ver momento",
        seeksToStart: true,
        seeksToEnd: true,
      };
    }

    // Kick: native `?t=` seek. Falls back to opening the page for non-VOD URLs.
    if (isKickHost(url)) {
      const vod = getKickVod(url);
      if (vod) {
        if (start > 0) url.searchParams.set("t", String(start));
        else url.searchParams.delete("t");
        return {
          url: url.toString(),
          action: "seek",
          label: "Ver momento",
          seeksToStart: start > 0,
          seeksToEnd: false,
          explanation:
            "Kick posiciona el reproductor en el inicio del clip; el final no se puede acotar desde la URL.",
        };
      }
      return {
        url: url.toString(),
        action: "open",
        label: "Abrir VOD",
        seeksToStart: false,
        seeksToEnd: false,
        explanation:
          "Este enlace es el del canal en directo, no de un VOD publicado. Asocia la URL del VOD al stream para saltar al momento.",
      };
    }

    if (["twitch.tv", "www.twitch.tv", "m.twitch.tv"].includes(url.hostname)) {
      const parts = url.pathname.split("/").filter(Boolean);
      const videoId = parts[0] === "videos" ? parts[1] : null;
      if (videoId && /^\d+$/.test(videoId)) {
        const params = new URLSearchParams({
          video: `v${videoId}`,
          parent: parentHost,
          time: formatTwitchTime(start),
          autoplay: "false",
        });
        return {
          url: `https://player.twitch.tv/?${params}`,
          action: "seek",
          label: "Ver momento",
          seeksToStart: true,
          seeksToEnd: false,
          explanation: "Twitch permite saltar al inicio; el final no se puede acotar desde la URL.",
        };
      }
    }

    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
      url.hash = `t=${start},${end}`;
      return {
        url: url.toString(),
        action: "seek",
        label: "Ver momento",
        seeksToStart: true,
        seeksToEnd: true,
      };
    }

    return {
      url: url.toString(),
      action: "open",
      label: "Abrir VOD",
      seeksToStart: false,
      seeksToEnd: false,
      explanation: "Esta plataforma no expone un salto temporal estable; se abre la URL guardada del stream.",
    };
  } catch {
    return {
      url: vodUrl,
      action: "open",
      label: "Abrir VOD",
      seeksToStart: false,
      seeksToEnd: false,
      explanation: "La URL guardada no es válida para crear un enlace con salto temporal.",
    };
  }
}
