export const FX_ERROR_CODES = {
  POSITION_UNAVAILABLE: 'FX_POSITION_UNAVAILABLE',
  INSUFFICIENT_SALDO: 'FX_INSUFFICIENT_SALDO',
  INVALID_RATE: 'FX_INVALID_RATE',
} as const;

export class CurrencyPositionUnavailableError extends Error {
  readonly code = FX_ERROR_CODES.POSITION_UNAVAILABLE;
  constructor() {
    super('Currency position is unavailable for sale');
  }
}

export class InsufficientSaldoError extends Error {
  readonly code = FX_ERROR_CODES.INSUFFICIENT_SALDO;
  constructor() {
    super('Insufficient saldo');
  }
}

export class InvalidRateError extends Error {
  readonly code = FX_ERROR_CODES.INVALID_RATE;
  constructor(message = 'Rate must be positive') {
    super(message);
  }
}

export type FxDomainError = CurrencyPositionUnavailableError | InsufficientSaldoError | InvalidRateError;
