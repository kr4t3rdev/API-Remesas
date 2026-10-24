import { Decimal } from 'decimal.js';

/**
 * Canonical decimal-string serialization for monetary and rate values.
 *
 * Decision (task 1.14, plan de clientes nativos): every monetary value
 * crosses the API boundary as a decimal **string**, never as a JSON number,
 * so no platform (TypeScript / Swift / Kotlin) re-parses it into a binary
 * float. Prisma `Decimal` columns already serialize this way via
 * `toJSON()`; this helper extends the same representation to values the
 * services compute on the fly.
 *
 * `Decimal.toString()` emits plain notation without exponent or trailing
 * zeros ("270.5000" -> "270.5"), matching what untouched Decimal fields
 * already send today.
 */
export function toDecimalString(value: Decimal.Value | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  // String() first: tolerates Decimal instances from any copy of the
  // library (e.g. the Prisma runtime one), Decimal-like objects that only
  // implement toString(), numbers and numeric strings.
  return new Decimal(String(value)).toString();
}
