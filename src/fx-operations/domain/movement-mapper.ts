import { CurrencyMovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export function mapTransferMovement(input: {
  userId: number;
  currencyId: number;
  positionId: number;
  transactionId: number;
  type: CurrencyMovementType;
  amount: Decimal;
  rate: Decimal;
  costSnapshot?: Decimal;
  realizedProfit?: Decimal;
}) {
  return {
    userId: input.userId,
    currencyId: input.currencyId,
    positionId: input.positionId,
    transactionId: input.transactionId,
    type: input.type,
    amount: input.amount,
    rate: input.rate,
    costSnapshot: input.costSnapshot,
    realizedProfit: input.realizedProfit,
  };
}
