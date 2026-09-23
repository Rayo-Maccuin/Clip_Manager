import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import {
  Clip,
  ClipStatus,
} from '../../domain/entities/clip.entity.js';
import type { ClipRepository } from '../../application/ports/clip.repository.js';

@Injectable()
export class PrismaClipRepository implements ClipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(clip: Clip): Promise<void> {
    await this.prisma.clip.create({
      data: {
        id: clip.id,
        streamId: clip.streamId,
        title: clip.title,
        description: clip.description,
        timestamp: clip.timestamp,
        duration: clip.duration,
        status: clip.status,
        createdAt: clip.createdAt,
        updatedAt: clip.updatedAt,
      },
    });
  }

  async update(clip: Clip): Promise<void> {
    await this.prisma.clip.update({
      where: {
        id: clip.id,
      },
      data: {
        title: clip.title,
        description: clip.description,
        timestamp: clip.timestamp,
        duration: clip.duration,
        status: clip.status,
        updatedAt: clip.updatedAt,
      },
    });
  }

  async findAllByStreamId(streamId: string): Promise<Clip[]> {
    const clips = await this.prisma.clip.findMany({
      where: {
        streamId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return clips.map((clip) =>
      Clip.rehydrate({
        id: clip.id,
        streamId: clip.streamId,
        title: clip.title,
        description: clip.description,
        timestamp: clip.timestamp,
        duration: clip.duration,
        status: clip.status as ClipStatus,
        createdAt: clip.createdAt,
        updatedAt: clip.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<Clip | null> {
    const clip = await this.prisma.clip.findUnique({
      where: {
        id,
      },
    });

    if (!clip) {
      return null;
    }

    return Clip.rehydrate({
      id: clip.id,
      streamId: clip.streamId,
      title: clip.title,
      description: clip.description,
      timestamp: clip.timestamp,
      duration: clip.duration,
      status: clip.status as ClipStatus,
      createdAt: clip.createdAt,
      updatedAt: clip.updatedAt,
    });
  }
}

