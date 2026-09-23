import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { Tag } from '../../domain/entities/tag.entity.js';
import type { TagRepository } from '../../application/ports/tag.repository.js';

@Injectable()
export class PrismaTagRepository implements TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tag: Tag): Promise<void> {
    await this.prisma.tag.create({
      data: {
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
      },
    });
  }

  async findAll(): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    return tags.map((tag) =>
      Tag.rehydrate({
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
      }),
    );
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return null;
    }

    return Tag.rehydrate({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { name },
    });

    if (!tag) {
      return null;
    }

    return Tag.rehydrate({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
    });
  }
}

