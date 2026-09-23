import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { Tag } from '../../../tags/domain/entities/tag.entity.js';
import type { ClipTagRepository } from '../../application/ports/clip-tag.repository.js';

@Injectable()
export class PrismaClipTagRepository implements ClipTagRepository {
constructor(private readonly prisma: PrismaService) {}

async addTag(clipId: string, tagId: string): Promise<void> {
await this.prisma.clipTag.create({
data: {
clipId,
tagId,
},
});
}

async removeTag(clipId: string, tagId: string): Promise<void> {
await this.prisma.clipTag.delete({
where: {
clipId_tagId: {
clipId,
tagId,
},
},
});
}

async findTagIdsByClipId(clipId: string): Promise<string[]> {
const clipTags = await this.prisma.clipTag.findMany({
where: {
clipId,
},
select: {
tagId: true,
},
});


return clipTags.map((clipTag) => clipTag.tagId);


}

async findTagsByClipId(clipId: string): Promise<Tag[]> {
const clipTags = await this.prisma.clipTag.findMany({
where: {
clipId,
},
include: {
tag: true,
},
orderBy: {
tag: {
name: 'asc',
},
},
});


return clipTags.map((clipTag) =>
  Tag.rehydrate({
    id: clipTag.tag.id,
    name: clipTag.tag.name,
    createdAt: clipTag.tag.createdAt,
  }),
);


}
}
