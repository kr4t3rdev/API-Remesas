import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyPositionUnavailableError, InsufficientSaldoError } from './domain-errors';

export function calculateWeightedAveragePurchase(
  currentSaldo: Decimal,
  currentAverage: Decimal,
  purchaseAmount: Decimal,
  purchaseRate: Decimal,
): Decimal {
  const nextSaldo = currentSaldo.add(purchaseAmount);
  return currentSaldo.eq(0)
    ? purchaseRate
    : currentSaldo.mul(currentAverage).add(purchaseAmount.mul(purchaseRate)).div(nextSaldo);
}

export function calculateSaleSnapshot(
  saldo: Decimal,
  averageCost: Decimal,
  saleAmount: Decimal,
  saleRate: Decimal,
) {
  if (saleAmount.gt(saldo)) throw new InsufficientSaldoError();
  return {
    remainingSaldo: saldo.sub(saleAmount),
    costSnapshot: averageCost,
    realizedProfit: saleRate.sub(averageCost).mul(saleAmount),
  };
}

export function assertSaleAvailable(
  position: { saldo: Decimal; reviewStatus: 'UNREVIEWED' | 'REVIEWED' },
  amount: Decimal,
): void {
  if (position.reviewStatus !== 'REVIEWED') throw new CurrencyPositionUnavailableError();
  if (amount.gt(position.saldo)) throw new InsufficientSaldoError();
}
