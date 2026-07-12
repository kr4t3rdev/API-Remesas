import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { CurrencyPositionUnavailableError, InsufficientSaldoError, InvalidRateError } from './domain/domain-errors';

@Catch(CurrencyPositionUnavailableError, InsufficientSaldoError, InvalidRateError)
export class FxDomainExceptionFilter implements ExceptionFilter {
  catch(exception: CurrencyPositionUnavailableError | InsufficientSaldoError | InvalidRateError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof InvalidRateError ? 422 : 409;
    response.status(status).json({ statusCode: status, code: exception.code, message: exception.message });
  }
}
