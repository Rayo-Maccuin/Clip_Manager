import { Inject, Injectable } from '@nestjs/common';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import type { ContentSuggestion } from '../services/content-suggestion.service.js';
import { ContentSuggestionService } from '../services/content-suggestion.service.js';

@Injectable()
export class GetClipSuggestionsUseCase {
constructor(
@Inject(CLIP_REPOSITORY)
private readonly clipRepository: ClipRepository,
private readonly contentSuggestionService: ContentSuggestionService,
) {}

async execute(
clipId: string,
): Promise<ContentSuggestion[] | null> {
const clip = await this.clipRepository.findById(clipId);

if (!clip) {
  return null;
}

return this.contentSuggestionService.suggest(clip.duration);

}
}
