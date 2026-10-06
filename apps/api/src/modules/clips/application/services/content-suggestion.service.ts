import { Injectable } from '@nestjs/common';

export type ContentPlatform = 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'KICK';

export type ContentFormat = 'SHORT' | 'REEL' | 'VIDEO' | 'HIGHLIGHT';

export interface StreamDurationBucket {
  label: string;
  minMinutes: number;
  maxMinutes: number | null;
  highlightIntervalMinutes: number;
  recommendedClipDuration: number;
  action: string;
}

export interface ContentSuggestion {
  platform: ContentPlatform;
  format: ContentFormat;
  reason: string;
  action: string;
}

const STREAM_BUCKETS: StreamDurationBucket[] = [
  { label: 'Corto', minMinutes: 0, maxMinutes: 30, highlightIntervalMinutes: 0, recommendedClipDuration: 0, action: 'Publicar clip completo' },
  { label: 'Medio', minMinutes: 30, maxMinutes: 120, highlightIntervalMinutes: 15, recommendedClipDuration: 60, action: 'Marcar highlights cada 15 minutos' },
  { label: 'Largo', minMinutes: 120, maxMinutes: null, highlightIntervalMinutes: 20, recommendedClipDuration: 90, action: 'Marcar highlights cada 20 minutos' },
];

const CLIP_LIMITS = [
  { max: 15, formats: [{ platform: 'TIKTOK', format: 'SHORT', reason: 'Clip ultracorto: ideal para TikTok y Reels.' }] as const },
  { max: 60, formats: [{ platform: 'TIKTOK', format: 'VIDEO', reason: 'Clip corto: perfecto para TikTok, Reels y YouTube Shorts.' }] as const },
  { max: 180, formats: [{ platform: 'TIKTOK', format: 'VIDEO', reason: 'Clip medio: funciona en TikTok y Reels; cabe en YouTube Shorts.' }, { platform: 'INSTAGRAM', format: 'REEL', reason: 'Encaja en el límite de Reels.' }, { platform: 'YOUTUBE', format: 'SHORT', reason: 'Cabe en el límite de 180 segundos de YouTube Shorts.' }] as const },
  { max: 600, formats: [{ platform: 'YOUTUBE', format: 'VIDEO', reason: 'Clip largo: considera editarlo o publicarlo como video completo en YouTube.' }] as const },
  { max: Infinity, formats: [{ platform: 'YOUTUBE', format: 'VIDEO', reason: 'Clip extendido: ideal para YouTube completo o divídelo en partes.' }] as const },
];

function getStreamBucket(streamDurationSeconds: number): StreamDurationBucket {
  const minutes = streamDurationSeconds / 60;
  return STREAM_BUCKETS.find((b) => minutes >= b.minMinutes && (b.maxMinutes === null || minutes < b.maxMinutes)) ?? STREAM_BUCKETS[STREAM_BUCKETS.length - 1];
}

function getClipFormats(clipDurationSeconds: number): { platform: ContentPlatform; format: ContentFormat; reason: string }[] {
  for (const limit of CLIP_LIMITS) {
    if (clipDurationSeconds <= limit.max) {
      return limit.formats.map((f) => ({ platform: f.platform, format: f.format, reason: f.reason }));
    }
  }
  return CLIP_LIMITS[CLIP_LIMITS.length - 1].formats.map((f) => ({ platform: f.platform, format: f.format, reason: f.reason }));
}

@Injectable()
export class ContentSuggestionService {
  suggest(streamDurationSeconds: number, clipDurationSeconds: number): ContentSuggestion[] {
    if (!Number.isInteger(streamDurationSeconds) || streamDurationSeconds <= 0) {
      return [];
    }

    const bucket = getStreamBucket(streamDurationSeconds);
    const clipFormats = getClipFormats(clipDurationSeconds);
    const suggestions: ContentSuggestion[] = [];

    suggestions.push({
      platform: 'KICK',
      format: 'HIGHLIGHT',
      reason: `Stream ${bucket.label.toLowerCase()} (${Math.floor(streamDurationSeconds / 60)} min). ${bucket.action}.`,
      action: bucket.action,
    });

    for (const format of clipFormats) {
      suggestions.push({
        platform: format.platform,
        format: format.format,
        reason: format.reason,
        action: `Distribuir en ${format.platform}`,
      });
    }

    return suggestions;
  }
}
