import { Decimal } from '@prisma/client/runtime/library';
import { FxOperationsService } from './fx-operations.service';
import {
  calculateWeightedAveragePurchase,
  calculateSaleSnapshot,
} from './domain/position-calculator';
import { CurrencyPositionUnavailableError, InsufficientSaldoError } from './domain/domain-errors';

describe('FX operations foundation', () => {
  it('calculates the weighted-average purchase cost', () => {
    expect(calculateWeightedAveragePurchase(new Decimal(100), new Decimal(250), new Decimal(50), new Decimal(260)).toFixed(2)).toBe('253.33');
  });

  it('keeps a sale cost snapshot and calculates realized performance', () => {
    const result = calculateSaleSnapshot(new Decimal(150), new Decimal(253.33), new Decimal(50), new Decimal(270));

    expect(result.remainingSaldo.toFixed(2)).toBe('100.00');
    expect(result.costSnapshot.toFixed(2)).toBe('253.33');
    expect(result.realizedProfit.toFixed(2)).toBe('833.50');
  });

  it('rejects an unreviewed position for sale', () => {
    expect(() =>
      FxOperationsService.assertSaleAvailable({ saldo: new Decimal(100), reviewStatus: 'UNREVIEWED' }, new Decimal(10)),
    ).toThrow(CurrencyPositionUnavailableError);
  });

  it('rejects a sale above available saldo without changing state', () => {
    expect(() =>
      FxOperationsService.assertSaleAvailable({ saldo: new Decimal(20), reviewStatus: 'REVIEWED' }, new Decimal(25)),
    ).toThrow(InsufficientSaldoError);
  });

  it('does not make a historical unreviewed saldo saleable when a purchase is attempted', async () => {
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'UNREVIEWED', reviewedAt: null }) },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 }))
      .rejects.toThrow(CurrencyPositionUnavailableError);
  });

  it('executes the transaction callback and rolls back canonical and legacy writes', async () => {
    const state = { transactions: [] as unknown[], movements: [] as unknown[], positions: [{ id: 1, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED', reviewedAt: null }], cash: [] as unknown[] };
    const snapshot = () => ({ transactions: [...state.transactions], movements: [...state.movements], positions: state.positions.map((position) => ({ ...position })), cash: [...state.cash] });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => {
        const before = snapshot();
        try {
          return await callback({
            exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
            currencyPosition: {
              findUnique: jest.fn().mockResolvedValue(state.positions[0]),
              update: jest.fn(async ({ data }: any) => Object.assign(state.positions[0], data)),
            },
            transaction: { create: jest.fn(async ({ data }: any) => { const value = { id: 11, ...data }; state.transactions.push(value); return value; }) },
            currencyMovement: { create: jest.fn(async ({ data }: any) => { const value = { id: 12, ...data }; state.movements.push(value); return value; }) },
            cashBalance: { upsert: jest.fn(async ({ data }: any) => { state.cash.push(data); if (state.cash.length === 2) throw new Error('legacy write failed'); }) },
          });
        } catch (error) {
          state.transactions = before.transactions;
          state.movements = before.movements;
          state.positions = before.positions;
          state.cash = before.cash;
          throw error;
        }
      }),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260 })).rejects.toThrow('legacy write failed');
    expect(state.transactions).toHaveLength(0);
    expect(state.movements).toHaveLength(0);
    expect(state.cash).toHaveLength(0);
    expect(state.positions[0].saldo).toEqual(new Decimal(0));
  });

  it('rolls back legacy and canonical writes when one write fails', async () => {
    const transaction = jest.fn().mockRejectedValue(new Error('legacy write failed'));
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: transaction,
    } as any;
    const service = new FxOperationsService(prisma);

    await expect(service.createTransfer(7, {
      type: 'COMPRA' as any,
      currencyId: 2,
      amount: 50,
      rate: 260,
    })).rejects.toThrow('legacy write failed');
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
