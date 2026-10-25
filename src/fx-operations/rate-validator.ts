import { Decimal } from '@prisma/client/runtime/library';
import { InvalidRateError } from './domain/domain-errors';

/**
 * Valida la tasa enviada por el cliente contra la tasa vigente del servidor.
 * Acepta decimal string o número: la aritmética es Decimal exacta (no float).
 */
export function validateServerRate(
  rate: string | number,
  referenceRate?: string | number,
  tolerance = 0.01,
): void {
  const rateDecimal = new Decimal(rate);
  if (!rateDecimal.isFinite() || rateDecimal.lessThanOrEqualTo(0)) throw new InvalidRateError();

  if (referenceRate !== undefined) {
    const reference = new Decimal(referenceRate);
    if (reference.isZero()) throw new InvalidRateError('Rate is outside the allowed tolerance');
    const deviation = rateDecimal.minus(reference).abs().div(reference);
    if (deviation.greaterThan(tolerance)) {
      throw new InvalidRateError('Rate is outside the allowed tolerance');
    }
  }
}
