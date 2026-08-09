import { Decimal } from '@prisma/client/runtime/library';
import { FxOperationsService } from './fx-operations.service';
import {
  calculateWeightedAveragePurchase,
  calculateSaleSnapshot,
} from './domain/position-calculator';
import { CurrencyPositionUnavailableError, InsufficientSaldoError, InvalidRateError } from './domain/domain-errors';
import { calculatePersistedRate } from './fx-operations.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFxTransferDto } from './dto/create-fx-transfer.dto';
import { OpenCurrencyPositionDto } from './dto/open-currency-position.dto';

describe('FX operations foundation', () => {
  it('rejects bank-backed legs when an FX transfer belongs to a worker', async () => {
    const prisma = { currency: { findUnique: jest.fn() } } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260,
      sourceType: 'BANK_ACCOUNT' as any, sourceBankAccountId: 3,
      destinationType: 'CASH' as any,
      workerId: 4, workerProfit: 1, workerCurrencyId: 2,
    } as any)).rejects.toThrow('Worker FX transfers must use CASH accounts only');
  });

  it('rejects bank account ids even when worker legs are declared as CASH', async () => {
    const prisma = { currency: { findUnique: jest.fn() } } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260,
      sourceType: 'CASH' as any, sourceBankAccountId: 3,
      destinationType: 'CASH' as any,
      workerId: 4, workerProfit: 1, workerCurrencyId: 2,
    } as any)).rejects.toThrow('Worker FX transfers must use CASH accounts only');
  });
  it('requires a worker balance currency when attaching an FX worker context', async () => {
    const prisma = { currency: { findUnique: jest.fn() } } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260, workerId: 4,
    } as any)).rejects.toThrow('workerId and workerCurrencyId must be provided together');
  });

  it('moves a worker purchase from primary balance into the purchased-currency balance', async () => {
    const workerTransactionCreate = jest.fn().mockResolvedValue({ id: 91 });
    const workerBalanceUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const cashBalanceUpdateMany = jest.fn();
    const cashBalanceUpsert = jest.fn();
    const workerBalanceFindUnique = jest.fn()
      .mockResolvedValueOnce({ id: 41, balance: new Decimal(3000), costBasisPrimary: new Decimal(0), currency: { id: 1, isActive: true } })
      .mockResolvedValueOnce({ id: 42, balance: new Decimal(5), costBasisPrimary: new Decimal(1000), currency: { id: 2, isActive: true } });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED' }), update: jest.fn().mockResolvedValue({}) },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: cashBalanceUpdateMany, upsert: cashBalanceUpsert },
        worker: { findFirst: jest.fn().mockResolvedValue({ id: 4 }) },
        workerBalance: { findUnique: workerBalanceFindUnique, upsert: jest.fn().mockResolvedValue({ id: 42, balance: new Decimal(5), costBasisPrimary: new Decimal(1000) }), updateMany: workerBalanceUpdateMany },
        workerTransaction: { create: workerTransactionCreate },
      })),
    } as any;
    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 200,
      workerId: 4, workerCurrencyId: 1,
    } as any);
    expect(cashBalanceUpdateMany).not.toHaveBeenCalled();
    expect(cashBalanceUpsert).not.toHaveBeenCalled();
    expect(workerBalanceUpdateMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { id: 41, balance: { gte: new Decimal(2000) } }, data: { balance: { decrement: new Decimal(2000) } } }));
    expect(workerBalanceUpdateMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: { id: 42 }, data: { balance: { increment: new Decimal(10) }, costBasisPrimary: { increment: new Decimal(2000) } } }));
    expect(workerTransactionCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ type: 'FX_CONVERSION', currencyId: 2, amount: new Decimal(10) }) }));
  });

  it('uses the worker balance as the source for a worker sale', async () => {
    const cashSourceUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const cashDestinationUpsert = jest.fn().mockResolvedValue({});
    const transactionCreate = jest.fn().mockResolvedValue({ id: 11 });
    const workerBalanceUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const workerTransactionCreate = jest.fn().mockResolvedValue({ id: 91 });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(25), costoPromedio: new Decimal(200), reviewStatus: 'REVIEWED' }), update: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        transaction: { create: transactionCreate },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: cashSourceUpdateMany, upsert: cashDestinationUpsert },
        worker: { findFirst: jest.fn().mockResolvedValue({ id: 4 }) },
        workerBalance: { findUnique: jest.fn().mockResolvedValue({ id: 41, balance: new Decimal(25), currency: { id: 2, isActive: true } }), updateMany: workerBalanceUpdateMany },
        workerTransaction: { create: workerTransactionCreate },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'VENTA' as any,
      currencyId: 2,
      amount: 10,
      rate: 250,
      workerId: 4,
      workerCurrencyId: 2,
    } as any);

    expect(cashSourceUpdateMany).not.toHaveBeenCalled();
    expect(cashDestinationUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_currencyId: { userId: 7, currencyId: 1 } },
      update: { balance: { increment: new Decimal(2500) } },
    }));
    expect(transactionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ workerCurrencyId: 2, workerProfit: undefined }),
    }));
    expect(workerBalanceUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 41, balance: { gte: new Decimal(10) } },
      data: expect.objectContaining({ accumulatedProfit: { increment: new Decimal(0) } }),
    }));
    expect(workerTransactionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ profit: new Decimal(0) }),
    }));
  });

  it('uses the selected worker balance when its currency differs from the sold currency', async () => {
    const transactionCreate = jest.fn().mockResolvedValue({ id: 11 });
    const workerBalanceFindUnique = jest.fn().mockResolvedValue({ id: 41, balance: new Decimal(25), currency: { id: 3, isActive: true } });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(25), costoPromedio: new Decimal(200), reviewStatus: 'REVIEWED' }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        transaction: { create: transactionCreate },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn(), upsert: jest.fn().mockResolvedValue({}) },
        worker: { findFirst: jest.fn().mockResolvedValue({ id: 4 }) },
        workerBalance: { findUnique: workerBalanceFindUnique, updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        workerTransaction: { create: jest.fn().mockResolvedValue({ id: 91 }) },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'VENTA' as any,
      currencyId: 2,
      amount: 10,
      rate: 250,
      workerId: 4,
      workerProfit: 3.5,
      workerCurrencyId: 3,
    } as any);

    expect(workerBalanceFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { workerId_currencyId: { workerId: 4, currencyId: 3 } },
    }));
    expect(transactionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ currencyId: 2, workerCurrencyId: 3 }),
    }));
  });

  it('rejects an FX transfer when the worker has no balance for the selected currency', async () => {
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED' }), update: jest.fn() },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) }, currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), upsert: jest.fn() },
        worker: { findFirst: jest.fn().mockResolvedValue({ id: 4 }) },
        workerBalance: { findUnique: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 200,
      workerId: 4, workerProfit: 1, workerCurrencyId: 2,
    } as any)).rejects.toThrow('Worker balance not found');
  });

  it('rolls back when the worker balance is insufficient', async () => {
    const workerBalanceUpdateMany = jest.fn().mockResolvedValue({ count: 0 });
    const transactionCreate = jest.fn().mockResolvedValue({ id: 11 });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED' }), update: jest.fn() },
        transaction: { create: transactionCreate }, currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), upsert: jest.fn() },
        worker: { findFirst: jest.fn().mockResolvedValue({ id: 4 }) },
        workerBalance: { findUnique: jest.fn().mockResolvedValue({ id: 41, balance: new Decimal(5), currency: { id: 1, isActive: true } }), upsert: jest.fn().mockResolvedValue({ id: 42, balance: new Decimal(0), costBasisPrimary: new Decimal(0) }), updateMany: workerBalanceUpdateMany },
        workerTransaction: { create: jest.fn() },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 200,
      workerId: 4, workerProfit: 1, workerCurrencyId: 1,
    } as any)).rejects.toThrow(InsufficientSaldoError);
    expect(transactionCreate).toHaveBeenCalledTimes(1);
    expect(workerBalanceUpdateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 41, balance: { gte: new Decimal(2000) } } }));
  });

  it('rolls back FX when the worker tenant check fails', async () => {
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED' }), update: jest.fn() },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) }, currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), upsert: jest.fn() },
        worker: { findFirst: jest.fn().mockResolvedValue(null) }, workerBalance: { upsert: jest.fn() }, workerTransaction: { create: jest.fn() },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 200, workerId: 99, workerProfit: 1, workerCurrencyId: 2 } as any)).rejects.toThrow('Trabajador no encontrado');
  });
  it('enforces database-compatible amount and rate precision at the API boundary', async () => {
    const dto = plainToInstance(CreateFxTransferDto, { type: 'COMPRA', currencyId: 2, amount: 10.123, rate: 260.12345 });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['amount', 'rate']));
  });

  it.each([
    [{ id: 2, code: 'USD', isActive: false }, { id: 1, code: 'CUP', isActive: true }],
    [{ id: 1, code: 'CUP', isActive: true }, { id: 1, code: 'CUP', isActive: true }],
  ])('rejects an inactive or CUP currency as the FX divisa', async (divisa, cup) => {
    const prisma = { currency: { findUnique: jest.fn().mockResolvedValueOnce(divisa).mockResolvedValueOnce(cup) } } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 }))
      .rejects.toThrow('Active non-CUP FX currency not found');
  });
  it('derives the selected side margin while preserving the reference rate', () => {
    expect(calculatePersistedRate('COMPRA' as any, new Decimal(250), new Decimal(200)).margin.toString()).toBe('0.2');
    expect(calculatePersistedRate('VENTA' as any, new Decimal(250), new Decimal(300)).margin.toString()).toBe('0.2');
  });

  it('rejects an active rate whose derived margin cannot be stored', () => {
    expect(() => calculatePersistedRate('COMPRA' as any, new Decimal(100), new Decimal(1100))).toThrow(InvalidRateError);
  });

  it('opens a historical position from the existing cash balance and records an opening movement', async () => {
    const positionCreate = jest.fn().mockResolvedValue({ id: 31, userId: 7, currencyId: 2, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'REVIEWED' });
    const movementCreate = jest.fn().mockResolvedValue({ id: 32 });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: new Decimal(100) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue(null), create: positionCreate },
        currencyMovement: { create: movementCreate },
      })),
    } as any;

    const dto: OpenCurrencyPositionDto = { currencyId: 2, openingCost: 250 };
    await expect(new FxOperationsService(prisma).openPosition(7, dto)).resolves.toEqual(expect.objectContaining({ movement: { id: 32 } }));
    expect(positionCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ saldo: new Decimal(100), openingSaldo: new Decimal(100), openingCost: new Decimal(250), reviewStatus: 'REVIEWED' }) });
    expect(movementCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ type: 'OPENING', amount: new Decimal(100), rate: new Decimal(250), costSnapshot: new Decimal(250) }) });
  });

  it('retries opening a position after a serializable write conflict', async () => {
    const conflict = new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)('write conflict', { code: 'P2034', clientVersion: '5.8.1' });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn()
        .mockRejectedValueOnce(conflict)
        .mockImplementationOnce(async (callback: any) => callback({
          cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: new Decimal(100) }) },
          currencyPosition: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 31 }) },
          currencyMovement: { create: jest.fn().mockResolvedValue({ id: 32 }) },
        })),
    } as any;

    await expect(new FxOperationsService(prisma).openPosition(7, { currencyId: 2, openingCost: 250 }))
      .resolves.toEqual(expect.objectContaining({ movement: { id: 32 } }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('exhausts serializable retries for manual FX transfers', async () => {
    const conflict = new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)('write conflict', { code: 'P2034', clientVersion: '5.8.1' });
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValue(null) },
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn().mockRejectedValue(conflict),
    } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260,
    }, 'retry-exhausted')).rejects.toBe(conflict);
    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
  });

  it('rejects opening a historical position for the base CUP currency', async () => {
    const prisma = {
      currency: { findUnique: jest.fn().mockResolvedValue({ id: 1, code: 'CUP', isActive: true }) },
    } as any;

    await expect(new FxOperationsService(prisma).openPosition(7, { currencyId: 1, openingCost: 1 }))
      .rejects.toThrow('Active non-CUP FX currency not found');
  });

  it('rejects automatic purchase when positive historical cash has not been opened', async () => {
    const prisma = {
      transaction: { findUnique: jest.fn() },
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED' }) },
        cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: new Decimal(100) }) },
      })),
    } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 }))
      .rejects.toThrow(CurrencyPositionUnavailableError);
  });

  it('rounds a reasonable active-rate margin and exposes the effective persisted rate', () => {
    const result = calculatePersistedRate('COMPRA' as any, new Decimal(300), new Decimal(260));
    expect(result.margin.toString()).toBe('0.1333');
    expect(result.effectiveRate.toString()).toBe('260.01');
  });

  it('returns the existing transfer for a repeated user-scoped idempotency key', async () => {
    const existing = { id: 11, userId: 7, idempotencyKey: 'fx-123', fxMovements: [{ id: 12 }] };
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValue(existing) },
      currency: { findUnique: jest.fn().mockResolvedValue({ id: 2 }) },
      $transaction: jest.fn(),
    } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260,
    }, 'fx-123')).resolves.toEqual({ transaction: existing, movement: existing.fxMovements[0] });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('rejects reuse of a key for a different transfer intent', async () => {
    const existing = { id: 11, userId: 7, idempotencyKey: 'fx-123', type: 'COMPRA', currencyId: 2, amount: 50, rate: 260, notes: null, fxMovements: [{ id: 12 }] };
    const prisma = { transaction: { findUnique: jest.fn().mockResolvedValue(existing) }, currency: { findUnique: jest.fn() }, $transaction: jest.fn() } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'VENTA' as any, currencyId: 2, amount: 50, rate: 260 }, 'fx-123'))
      .rejects.toThrow('Idempotency key was already used for a different transfer');
  });
  it('treats worker context as part of idempotent intent', async () => {
    const existing = {
      id: 11, userId: 7, idempotencyKey: 'fx-worker', type: 'COMPRA', currencyId: 2,
      amount: 50, rate: 260, notes: null, workerId: 4, workerProfit: new Decimal('3.50'),
      workerCurrencyId: 2, fxMovements: [{ id: 12 }],
    };
    const prisma = { transaction: { findUnique: jest.fn().mockResolvedValue(existing) }, currency: { findUnique: jest.fn() }, $transaction: jest.fn() } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260,
      workerId: 4, workerProfit: 3.5, workerCurrencyId: 2,
    }, 'fx-worker')).resolves.toEqual({ transaction: existing, movement: existing.fxMovements[0] });
    expect(prisma.$transaction).not.toHaveBeenCalled();

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260,
      workerId: 4, workerProfit: 4, workerCurrencyId: 2,
    }, 'fx-worker')).resolves.toEqual({ transaction: existing, movement: existing.fxMovements[0] });
  });
  it('includes operation kind and rate persistence in idempotency intent', async () => {
    const existing = { id: 11, userId: 7, type: 'COMPRA', currencyId: 2, amount: 50, rate: 260, notes: null, operationKind: 'TRANSFER', persistRate: false, sourceType: 'CASH', destinationType: 'CASH', fxMovements: [] };
    const prisma = { transaction: { findUnique: jest.fn().mockResolvedValue(existing) } } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260,
      operationKind: 'REMITTANCE' as any, persistRate: false,
    }, 'fx-kind')).rejects.toThrow('Idempotency key was already used for a different transfer');
  });
  it('classifies a manual remittance and persists only the selected active-rate side atomically', async () => {
    const createTransaction = jest.fn().mockImplementation(({ data }) => ({ id: 11, ...data }));
    const updateRate = jest.fn().mockResolvedValue({});
    const createRateHistory = jest.fn().mockResolvedValue({});
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: {
          findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250), buyMargin: new Decimal(0.1), sellMargin: new Decimal(0.2) }),
          update: updateRate,
        },
        rateHistory: { create: createRateHistory },
        currencyPosition: {
          findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED', reviewedAt: new Date() }),
          update: jest.fn().mockResolvedValue({}),
        },
        transaction: { create: createTransaction },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), upsert: jest.fn().mockResolvedValue({}) },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 200,
      operationKind: 'REMITTANCE' as any, persistRate: true,
    });

    expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ operationKind: 'REMITTANCE', persistRate: true }) }));
    expect(updateRate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ buyMargin: new Decimal(0.2) }) }));
    expect(updateRate.mock.calls[0][0].data).not.toHaveProperty('sellMargin');
    expect(createRateHistory).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ referenceType: 'FX_TRANSACTION', referenceId: 11 }) }));
  });
  it('settles cash FX against the configured non-CUP primary currency', async () => {
    const sourceCashUpdate = jest.fn().mockResolvedValue({ count: 1 });
    const destinationCashUpsert = jest.fn().mockResolvedValue({});
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrencyId: 3, primaryCurrency: { id: 3, code: 'EUR', isActive: true } }) },
      currency: { findUnique: jest.fn().mockResolvedValue({ id: 2, code: 'USD', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(1.1) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED' }), update: jest.fn().mockResolvedValue({}) },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: sourceCashUpdate, upsert: destinationCashUpsert },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 1.1 });

    expect(sourceCashUpdate).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: 7, currencyId: 3 }) }));
    expect(destinationCashUpsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_currencyId: { userId: 7, currencyId: 2 } } }));
  });

  it('uses configured primary currency for bank settlement and persisted RateHistory', async () => {
    const bankFindFirst = jest.fn()
      .mockResolvedValueOnce({ id: 30, userId: 7, currencyId: 3, isActive: true })
      .mockResolvedValueOnce({ id: 20, userId: 7, currencyId: 2, isActive: true });
    const rateHistoryCreate = jest.fn().mockResolvedValue({});
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValue(null) },
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrencyId: 3, primaryCurrency: { id: 3, code: 'EUR', isActive: true } }) },
      currency: { findUnique: jest.fn().mockResolvedValue({ id: 2, code: 'USD', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(1.25) }), update: jest.fn().mockResolvedValue({}) },
        rateHistory: { create: rateHistoryCreate },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED' }), update: jest.fn().mockResolvedValue({}) },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        bankAccount: { findFirst: bankFindFirst, updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        cashBalance: { updateMany: jest.fn(), upsert: jest.fn() },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 1.1, persistRate: true,
      sourceType: 'BANK_ACCOUNT' as any, sourceBankAccountId: 30,
      destinationType: 'BANK_ACCOUNT' as any, destinationBankAccountId: 20,
    }, 'non-cup-primary');

    expect(bankFindFirst).toHaveBeenNthCalledWith(1, { where: { id: 30, userId: 7, isActive: true } });
    expect(bankFindFirst).toHaveBeenNthCalledWith(2, { where: { id: 20, userId: 7, isActive: true } });
    expect(rateHistoryCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ currencyFromId: 2, currencyToId: 3 }) }));
  });
  it('settles a standard sale across the FX position and configured primary cash', async () => {
    const positionUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const sourceCashUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const destinationCashUpsert = jest.fn().mockResolvedValue({});
    const transactionCreate = jest.fn().mockResolvedValue({ id: 11 });
    const movementCreate = jest.fn().mockResolvedValue({ id: 12 });
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValue(null) },
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250) }) },
        currencyPosition: {
          findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'REVIEWED' }),
          updateMany: positionUpdateMany,
        },
        transaction: { create: transactionCreate },
        currencyMovement: { create: movementCreate },
        cashBalance: { updateMany: sourceCashUpdateMany, upsert: destinationCashUpsert },
      })),
    } as any;

    const result = await new FxOperationsService(prisma).createTransfer(7, {
      type: 'VENTA' as any, currencyId: 2, amount: 10, rate: 270,
    }, 'standard-sale');

    expect(positionUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 9, reviewStatus: 'REVIEWED', saldo: { gte: new Decimal(10) } },
      data: { saldo: { decrement: new Decimal(10) } },
    }));
    expect(sourceCashUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 7, currencyId: 2, balance: { gte: new Decimal(10) } },
      data: { balance: { decrement: new Decimal(10) } },
    }));
    expect(destinationCashUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_currencyId: { userId: 7, currencyId: 1 } },
      update: { balance: { increment: new Decimal(2700) } },
    }));
    expect(transactionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ totalCup: new Decimal(2700), marginProfit: new Decimal(200) }),
    }));
    expect((result as any).realizedProfit).toEqual(new Decimal(200));
  });
  it('does not replay a different intent after a concurrent unique-key race', async () => {
    const raced = { id: 11, userId: 7, idempotencyKey: 'fx-race', type: 'COMPRA', currencyId: 2, amount: new Decimal(50), rate: new Decimal(260), notes: null, fxMovements: [{ id: 12 }] };
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(raced) },
      currency: { findUnique: jest.fn().mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true }).mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn().mockRejectedValue(new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)('duplicate', { code: 'P2002', clientVersion: '5.8.1' })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'VENTA' as any, currencyId: 2, amount: 50, rate: 260 }, 'fx-race'))
      .rejects.toThrow('Idempotency key was already used for a different transfer');
  });
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

  it('routes purchase legs through selected bank accounts', async () => {
    const bankUpdates: any[] = [];
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
        currencyPosition: {
          findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED', reviewedAt: null }),
          update: jest.fn().mockResolvedValue({}),
        },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        bankAccount: {
          findFirst: jest.fn()
            .mockResolvedValueOnce({ id: 3, userId: 7, currencyId: 1, isActive: true, balance: new Decimal(10000) })
            .mockResolvedValueOnce({ id: 4, userId: 7, currencyId: 2, isActive: true, balance: new Decimal(0) }),
          updateMany: jest.fn(async (args: any) => { bankUpdates.push(args); return { count: 1 }; }),
        },
        cashBalance: { upsert: jest.fn() },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260,
      sourceType: 'BANK_ACCOUNT' as any, sourceBankAccountId: 3,
      destinationType: 'BANK_ACCOUNT' as any, destinationBankAccountId: 4,
    });

    expect(bankUpdates).toHaveLength(2);
    expect(bankUpdates[0].data.balance.increment.toString()).toBe('-2600');
    expect(bankUpdates[1].data.balance.increment.toString()).toBe('10');
  });

  it('rejects a cash source when the atomic balance guard finds insufficient funds', async () => {
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED', reviewedAt: null }), update: jest.fn() },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) }, currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), upsert: jest.fn() },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 })).rejects.toThrow(InsufficientSaldoError);
  });
});
