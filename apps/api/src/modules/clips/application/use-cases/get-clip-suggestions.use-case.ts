import { Inject, Injectable } from '@nestjs/common';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import { STREAM_REPOSITORY } from '../../../streams/application/ports/stream-repository.token.js';
import type { ContentSuggestion } from '../services/content-suggestion.service.js';
import { ContentSuggestionService } from '../services/content-suggestion.service.js';

@Injectable()
export class GetClipSuggestionsUseCase {
constructor(
@Inject(CLIP_REPOSITORY)
private readonly clipRepository: ClipRepository,
@Inject(STREAM_REPOSITORY)
private readonly streamRepository: any,
private readonly contentSuggestionService: ContentSuggestionService,
) {}

async execute(
clipId: string,
): Promise<ContentSuggestion[] | null> {
const clip = await this.clipRepository.findById(clipId);

if (!clip) {
  return null;
}

const stream = await this.streamRepository.findById(clip.streamId);
const streamDuration = stream && stream.endedAt
  ? Math.max(0, Math.floor((new Date(stream.endedAt).getTime() - new Date(stream.startedAt).getTime()) / 1000))
  : Math.max(0, Math.floor((Date.now() - new Date(stream?.startedAt ?? Date.now()).getTime()) / 1000));

return this.contentSuggestionService.suggest(streamDuration, clip.duration);

}
}
