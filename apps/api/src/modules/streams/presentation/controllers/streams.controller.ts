import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStreamUseCase } from '../../application/use-cases/create-stream.use-case.js';
import { EndStreamUseCase } from '../../application/use-cases/end-stream.use-case.js';
import { GetStreamUseCase } from '../../application/use-cases/get-stream.use-case.js';
import { ListStreamsUseCase } from '../../application/use-cases/list-streams.use-case.js';
import { CreateStreamDto } from '../dto/create-stream.dto.js';
import { EndStreamDto } from '../dto/end-stream.dto.js';

@Controller('streams')
export class StreamsController {
  constructor(
    private readonly createStreamUseCase: CreateStreamUseCase,
    private readonly endStreamUseCase: EndStreamUseCase,
    private readonly getStreamUseCase: GetStreamUseCase,
    private readonly listStreamsUseCase: ListStreamsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateStreamDto) {
    const stream = await this.createStreamUseCase.execute({
      title: dto.title,
      vodUrl: dto.vodUrl,
      startedAt: new Date(dto.startedAt),
    });

    return {
      id: stream.id,
      title: stream.title,
      vodUrl: stream.vodUrl,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      createdAt: stream.createdAt,
    };
  }

  @Get()
  async findAll() {
    const streams = await this.listStreamsUseCase.execute();

    return streams.map((stream) => ({
      id: stream.id,
      title: stream.title,
      vodUrl: stream.vodUrl,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      createdAt: stream.createdAt,
    }));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const stream = await this.getStreamUseCase.execute(id);

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return {
      id: stream.id,
      title: stream.title,
      vodUrl: stream.vodUrl,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      createdAt: stream.createdAt,
    };
  }

  @Patch(':id/end')
  async end(@Param('id') id: string, @Body() dto: EndStreamDto) {
    const stream = await this.endStreamUseCase.execute({
      id,
      endedAt: new Date(dto.endedAt),
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return {
      id: stream.id,
      title: stream.title,
      vodUrl: stream.vodUrl,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      createdAt: stream.createdAt,
    };
  }
}

