import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service.js';
import { Stream } from '../../domain/entities/stream.entity.js';
import type { StreamRepository } from '../../application/ports/stream.repository.js';

@Injectable()
export class PrismaStreamRepository implements StreamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(stream: Stream): Promise<void> {
    await this.prisma.stream.create({
      data: {
        id: stream.id,
        title: stream.title,
        vodUrl: stream.vodUrl,
        startedAt: stream.startedAt,
        endedAt: stream.endedAt,
        createdAt: stream.createdAt,
      },
    });
  }

  async update(stream: Stream): Promise<void> {
    await this.prisma.stream.update({
      where: {
        id: stream.id,
      },
      data: {
        title: stream.title,
        vodUrl: stream.vodUrl,
        startedAt: stream.startedAt,
        endedAt: stream.endedAt,
      },
    });
  }

  async findAll(): Promise<Stream[]> {
    const streams = await this.prisma.stream.findMany({
      orderBy: {
        startedAt: 'desc',
      },
    });

    return streams.map((stream) =>
      Stream.rehydrate({
        id: stream.id,
        title: stream.title,
        vodUrl: stream.vodUrl,
        startedAt: stream.startedAt,
        endedAt: stream.endedAt,
        createdAt: stream.createdAt,
      }),
    );
  }

  async findById(id: string): Promise<Stream | null> {
    const stream = await this.prisma.stream.findUnique({
      where: {
        id,
      },
    });

    if (!stream) {
      return null;
    }

    return Stream.rehydrate({
      id: stream.id,
      title: stream.title,
      vodUrl: stream.vodUrl,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      createdAt: stream.createdAt,
    });
  }
}
