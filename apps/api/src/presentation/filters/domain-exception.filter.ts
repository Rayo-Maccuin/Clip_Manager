import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { InvalidClipStatusTransitionError } from '../../modules/clips/domain/errors/invalid-clip-status-transition.error.js';

@Catch(InvalidClipStatusTransitionError)
export class DomainExceptionFilter
  implements ExceptionFilter<InvalidClipStatusTransitionError>
{
  catch(
    exception: InvalidClipStatusTransitionError,
    host: ArgumentsHost,
  ): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      path: request.url,
    });
  }
}

