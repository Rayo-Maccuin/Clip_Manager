import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../auth/presentation/roles.decorator.js';
import { RolesGuard } from '../../../auth/presentation/roles.guard.js';
import { CreateStreamUseCase } from '../../application/use-cases/create-stream.use-case.js';
import { DeleteStreamUseCase } from '../../application/use-cases/delete-stream.use-case.js';
import { EndStreamUseCase } from '../../application/use-cases/end-stream.use-case.js';
import { GetStreamUseCase } from '../../application/use-cases/get-stream.use-case.js';
import { ListStreamsUseCase } from '../../application/use-cases/list-streams.use-case.js';
import { UpdateStreamVodUseCase } from '../../application/use-cases/update-stream-vod.use-case.js';
import { CreateStreamDto } from '../dto/create-stream.dto.js';
import { EndStreamDto } from '../dto/end-stream.dto.js';
import { UpdateStreamVodDto } from '../dto/update-stream-vod.dto.js';

@Controller('streams')
@UseGuards(RolesGuard)
export class StreamsController {
  constructor(
    private readonly createStreamUseCase: CreateStreamUseCase,
    private readonly endStreamUseCase: EndStreamUseCase,
    private readonly getStreamUseCase: GetStreamUseCase,
    private readonly listStreamsUseCase: ListStreamsUseCase,
    private readonly deleteStreamUseCase: DeleteStreamUseCase,
    private readonly updateStreamVodUseCase: UpdateStreamVodUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'MODERATOR')
  async create(@Body() dto: CreateStreamDto) {
    const stream = await this.createStreamUseCase.execute({
      title: dto.title,
      vodUrl: dto.vodUrl,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
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

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const deleted = await this.deleteStreamUseCase.execute({ id });

    if (!deleted) {
      throw new NotFoundException('Stream not found');
    }

    return { message: 'Stream eliminado' };
  }

  @Patch(':id/end')
  @Roles('ADMIN')
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

  @Patch(':id/vod')
  @Roles('ADMIN')
  async updateVod(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStreamVodDto,
  ) {
    const stream = await this.updateStreamVodUseCase.execute({
      id,
      vodUrl: dto.vodUrl,
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