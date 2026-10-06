import { describe, expect, it } from 'vitest';
import { ContentSuggestionService } from './content-suggestion.service.js';

describe('ContentSuggestionService', () => {
  const service = new ContentSuggestionService();

  it('suggests stream action + short formats for a short stream and short clip', () => {
    const suggestions = service.suggest(20 * 60, 30);

    expect(suggestions.map(({ platform, format }) => [platform, format])).toEqual([
      ['KICK', 'HIGHLIGHT'],
      ['TIKTOK', 'VIDEO'],
    ]);
    expect(suggestions[0].reason).toContain('Stream corto');
    expect(suggestions[0].action).toBe('Publicar clip completo');
  });

  it('suggests stream action + short formats for a short stream and medium clip', () => {
    const suggestions = service.suggest(20 * 60, 120);

    expect(suggestions.map(({ platform, format }) => [platform, format])).toEqual([
      ['KICK', 'HIGHLIGHT'],
      ['TIKTOK', 'VIDEO'],
      ['INSTAGRAM', 'REEL'],
      ['YOUTUBE', 'SHORT'],
    ]);
  });

  it('suggests stream action + standard video for a short stream and long clip', () => {
    const suggestions = service.suggest(20 * 60, 300);

    expect(suggestions.map(({ platform, format }) => [platform, format])).toEqual([
      ['KICK', 'HIGHLIGHT'],
      ['YOUTUBE', 'VIDEO'],
    ]);
  });

  it('suggests highlights every 15 min for medium streams', () => {
    const suggestions = service.suggest(45 * 60, 90);
    const kick = suggestions.find((s) => s.platform === 'KICK');

    expect(kick).toBeDefined();
    expect(kick?.reason).toContain('Stream medio');
    expect(kick?.action).toBe('Marcar highlights cada 15 minutos');
  });

  it('suggests highlights every 20 min for long streams', () => {
    const suggestions = service.suggest(3 * 60 * 60, 120);
    const kick = suggestions.find((s) => s.platform === 'KICK');

    expect(kick).toBeDefined();
    expect(kick?.reason).toContain('Stream largo');
    expect(kick?.action).toBe('Marcar highlights cada 20 minutos');
  });

  it('does not suggest formats for invalid stream durations', () => {
    expect(service.suggest(0, 30)).toEqual([]);
    expect(service.suggest(-10, 30)).toEqual([]);
  });
});