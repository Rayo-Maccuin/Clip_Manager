import { Injectable } from '@nestjs/common';

export type ContentPlatform = 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM';

export type ContentFormat = 'SHORT' | 'REEL' | 'VIDEO';

export interface ContentSuggestion {
platform: ContentPlatform;
format: ContentFormat;
reason: string;
}

@Injectable()
export class ContentSuggestionService {
suggest(duration: number): ContentSuggestion[] {
if (!Number.isInteger(duration) || duration <= 0) {
return [];
}

if (duration <= 60) {
  return [
    {
      platform: 'TIKTOK',
      format: 'VIDEO',
      reason: 'La duración es adecuada para contenido vertical breve.',
    },
    {
      platform: 'INSTAGRAM',
      format: 'REEL',
      reason: 'La duración es adecuada para un Reel corto.',
    },
    {
      platform: 'YOUTUBE',
      format: 'SHORT',
      reason: 'La duración es adecuada para el formato Short.',
    },
  ];
}

if (duration <= 180) {
  return [
    {
      platform: 'TIKTOK',
      format: 'VIDEO',
      reason: 'La duración puede funcionar para contenido vertical breve.',
    },
    {
      platform: 'INSTAGRAM',
      format: 'REEL',
      reason: 'La duración puede funcionar para un Reel.',
    },
    {
      platform: 'YOUTUBE',
      format: 'VIDEO',
      reason: 'La duración también permite publicarlo como video de YouTube.',
    },
  ];
}

return [
  {
    platform: 'YOUTUBE',
    format: 'VIDEO',
    reason: 'La duración es más apropiada para un video de YouTube.',
  },
];


}
}
