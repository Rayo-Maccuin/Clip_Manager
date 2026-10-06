import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case.js';
import { ListTagsUseCase } from '../../application/use-cases/list-tags.use-case.js';
import { DeleteTagUseCase } from '../../application/use-cases/delete-tag.use-case.js';
import { CreateTagDto } from '../dto/create-tag.dto.js';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly listTagsUseCase: ListTagsUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTagDto) {
    const tag = await this.createTagUseCase.execute({
      name: dto.name,
    });

    return this.toResponse(tag);
  }

  @Get()
  async findAll() {
    const tags = await this.listTagsUseCase.execute();

    return tags.map((tag) => this.toResponse(tag));
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteTagUseCase.execute(id);
    return { success: true, message: 'Etiqueta eliminada' };
  }

  private toResponse(tag: {
    id: string;
    name: string;
    createdAt: Date;
    usageCount?: number;
  }) {
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      usageCount: tag.usageCount ?? 0,
    };
  }
}

