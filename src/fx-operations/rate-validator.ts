import { InvalidRateError } from './domain/domain-errors';

export function validateServerRate(rate: number, referenceRate?: number, tolerance = 0.01): void {
  if (!Number.isFinite(rate) || rate <= 0) throw new InvalidRateError();
  if (referenceRate !== undefined && Math.abs(rate - referenceRate) / referenceRate > tolerance) {
    throw new InvalidRateError('Rate is outside the allowed tolerance');
  }
}
