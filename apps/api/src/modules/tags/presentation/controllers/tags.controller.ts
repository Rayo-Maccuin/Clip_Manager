import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case.js';
import { ListTagsUseCase } from '../../application/use-cases/list-tags.use-case.js';
import { CreateTagDto } from '../dto/create-tag.dto.js';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly listTagsUseCase: ListTagsUseCase,
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

  private toResponse(tag: {
    id: string;
    name: string;
    createdAt: Date;
  }) {
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
    };
  }
}

