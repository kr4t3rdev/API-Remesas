import { BadRequestException } from '@nestjs/common';
import { WorkerPaymentsService } from './worker-payments.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { validate } from 'class-validator';
import { AddBalanceDto, DepositDto, CreateTransactionDto } from './dto';

describe('WorkerPaymentsService multicurrency ledger', () => {
  const workerBalance = { id: 10, workerId: 1, currencyId: 1, balance: new Decimal(100), costBasisPrimary: new Decimal(0), accumulatedProfit: new Decimal(0), totalDelivered: new Decimal(0) };
  const tx: any = {
  worker: { findFirst: jest.fn().mockResolvedValue({ id: 1, user: { primaryCurrencyId: 1 } }) },
    currency: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
    workerBalance: { upsert: jest.fn().mockResolvedValue(workerBalance), update: jest.fn().mockResolvedValue(workerBalance) },
    workerTransaction: { create: jest.fn().mockResolvedValue({ id: 1 }) },
    cashBalance: { findUnique: jest.fn(), update: jest.fn() },
    bankAccount: { findFirst: jest.fn(), update: jest.fn() },
    exchangeRate: { findUnique: jest.fn().mockResolvedValue({ buyRate: new Decimal(250) }) },
  };
  const prisma: any = { ...tx, $transaction: jest.fn((callback: any) => callback(tx)), worker: { findFirst: tx.worker.findFirst }, currency: tx.currency };
  let service: WorkerPaymentsService;
  beforeAll(() => { service = new WorkerPaymentsService(prisma); });
  beforeEach(() => { jest.clearAllMocks(); tx.worker.findFirst.mockResolvedValue({ id: 1, user: { primaryCurrencyId: 1 } }); tx.currency.findFirst.mockResolvedValue({ id: 1 }); tx.workerBalance.upsert.mockResolvedValue(workerBalance); });

  it('rejects missing or inactive currencies before creating a worker balance', async () => {
    tx.currency.findFirst.mockResolvedValueOnce(null);
    await expect(service.addBalance(1, { amount: 10, currencyId: 99 }, 7)).rejects.toThrow(/moneda no existe o está inactiva/i);
    expect(tx.workerBalance.upsert).not.toHaveBeenCalled();

    tx.currency.findFirst.mockResolvedValueOnce(null);
    await expect(service.deposit(1, { amount: 10, currencyId: 99 }, 7)).rejects.toThrow(/moneda no existe o está inactiva/i);
    expect(tx.workerBalance.upsert).not.toHaveBeenCalled();
  });

  it('requires currency for every monetary operation', async () => {
    await expect(service.addBalance(1, { amount: 10 } as any, 7)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.deposit(1, { amount: 10 } as any, 7)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires a destination to reconcile a worker deposit', async () => {
    await expect(service.deposit(1, { amount: 10, currencyId: 1 }, 7)).rejects.toThrow(/destino es obligatorio/i);
    expect(tx.workerTransaction.create).not.toHaveBeenCalled();
  });

  it('keeps separate balances for two currencies', async () => {
    const usd = { ...workerBalance, id: 11, currencyId: 2, balance: new Decimal(25) };
    tx.workerBalance.upsert.mockResolvedValueOnce(workerBalance).mockResolvedValueOnce(usd);
    await service.addBalance(1, { amount: 10, currencyId: 1 }, 7);
    await service.addBalance(1, { amount: 10, currencyId: 2 }, 7);
    expect(tx.workerBalance.upsert).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { workerId_currencyId: { workerId: 1, currencyId: 1 } } }));
    expect(tx.workerBalance.upsert).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: { workerId_currencyId: { workerId: 1, currencyId: 2 } } }));
    expect(tx.workerTransaction.create).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: expect.objectContaining({ currencyId: 1 }) }));
    expect(tx.workerTransaction.create).toHaveBeenNthCalledWith(2, expect.objectContaining({ data: expect.objectContaining({ currencyId: 2 }) }));
  });

  it('rejects missing or inactive bank accounts', async () => {
    tx.bankAccount.findFirst.mockResolvedValue(null);
    await expect(service.addBalance(1, { amount: 10, sourceType: 'BANK_ACCOUNT', sourceId: 99, currencyId: 1 }, 7)).rejects.toThrow(/cuenta bancaria/i);
    tx.bankAccount.findFirst.mockResolvedValue({ id: 99, userId: 7, currencyId: 1, balance: 20, isActive: false });
    await expect(service.addBalance(1, { amount: 10, sourceType: 'BANK_ACCOUNT', sourceId: 99, currencyId: 1 }, 7)).rejects.toThrow('activa');
  });

  it('rejects bank currency mismatch', async () => {
    tx.bankAccount.findFirst.mockResolvedValue({ id: 99, userId: 7, currencyId: 2, balance: 20, isActive: true });
    await expect(service.addBalance(1, { amount: 10, sourceType: 'BANK_ACCOUNT', sourceId: 99, currencyId: 1 }, 7)).rejects.toThrow('moneda');
  });

  it('rejects a destination that does not exist before debiting worker', async () => {
    tx.cashBalance.findUnique.mockResolvedValue(null);
    await expect(service.deposit(1, { amount: 10, destinationType: 'CASH', currencyId: 1 }, 7)).rejects.toThrow(/caja/i);
    expect(tx.workerTransaction.create).not.toHaveBeenCalled();
  });

  it('credits a validated cash destination in the same transaction as the worker debit', async () => {
    tx.cashBalance.findUnique.mockResolvedValue({ userId: 7, currencyId: 1, balance: new Decimal(20) });
    tx.cashBalance.update.mockResolvedValue({});

    await service.deposit(1, { amount: 10, destinationType: 'CASH', currencyId: 1 }, 7);

    expect(tx.workerBalance.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ balance: { decrement: new Decimal(10) } }),
    }));
    expect(tx.cashBalance.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_currencyId: { userId: 7, currencyId: 1 } },
      data: { balance: { increment: new Decimal(10) } },
    }));
  });

  it('calculates automatic performance when foreign worker funds are deposited', async () => {
    const foreignBalance = {
      ...workerBalance,
      currencyId: 2,
      balance: new Decimal(10),
      costBasisPrimary: new Decimal(2000),
    };
    tx.workerBalance.upsert.mockResolvedValue(foreignBalance);
    tx.worker.update = jest.fn().mockResolvedValue({});
    tx.exchangeRate.findUnique.mockResolvedValue({ buyRate: new Decimal(250) });
    tx.cashBalance.findUnique.mockResolvedValue({ userId: 7, currencyId: 2, balance: new Decimal(20) });
    tx.cashBalance.update.mockResolvedValue({});

    await service.deposit(1, { amount: 4, destinationType: 'CASH', currencyId: 2 }, 7);

    expect(tx.workerBalance.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: foreignBalance.id },
      data: expect.objectContaining({
        balance: { decrement: new Decimal(4) },
        costBasisPrimary: { decrement: new Decimal(800) },
        accumulatedProfit: { increment: new Decimal(200) },
        totalDelivered: { increment: new Decimal(4) },
      }),
    }));
    expect(tx.worker.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { accumulatedProfit: { increment: new Decimal(200) } },
    }));
    expect(tx.workerTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'DEPOSIT', amount: new Decimal(4), profit: new Decimal(200) }),
    }));
  });

  it('calculates performance when FX sale proceeds are deposited in the primary currency', async () => {
    const primaryBalance = {
      ...workerBalance,
      currencyId: 1,
      balance: new Decimal(2500),
      costBasisPrimary: new Decimal(2000),
    };
    tx.workerBalance.upsert.mockResolvedValue(primaryBalance);
    tx.worker.update = jest.fn().mockResolvedValue({});
    tx.cashBalance.findUnique.mockResolvedValue({ userId: 7, currencyId: 1, balance: new Decimal(20) });
    tx.cashBalance.update.mockResolvedValue({});

    await service.deposit(1, { amount: 2500, destinationType: 'CASH', currencyId: 1 }, 7);

    expect(tx.workerBalance.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: primaryBalance.id },
      data: expect.objectContaining({
        balance: { decrement: new Decimal(2500) },
        costBasisPrimary: { decrement: new Decimal(2000) },
        accumulatedProfit: { increment: new Decimal(500) },
        totalDelivered: { increment: new Decimal(2500) },
      }),
    }));
    expect(tx.worker.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { accumulatedProfit: { increment: new Decimal(500) } },
    }));
    expect(tx.workerTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'DEPOSIT', amount: new Decimal(2500), profit: new Decimal(500) }),
    }));
  });

  it.each([
    ['addBalance', () => service.addBalance(1, { amount: 10, sourceId: 9, currencyId: 1 } as any, 7)],
    ['deposit', () => service.deposit(1, { amount: 10, destinationId: 9, currencyId: 1 } as any, 7)],
    ['createTransaction', () => service.createTransaction(1, { amount: 10, profit: 0, destinationId: 9, currencyId: 1 } as any, 7)],
  ])('rejects an %s id when its type is omitted', async (_operation, invoke) => {
    await expect(invoke()).rejects.toThrow(/id requiere un tipo/i);
    expect(tx.workerTransaction.create).not.toHaveBeenCalled();
  });

  it.each([
    ['AddBalanceDto', AddBalanceDto, { amount: 1, currencyId: 1.5, sourceId: 2.5 }],
    ['DepositDto', DepositDto, { amount: 1, currencyId: 1.5, destinationId: 2.5 }],
    ['CreateTransactionDto', CreateTransactionDto, { amount: 1, profit: 0, currencyId: 1.5, destinationId: 2.5 }],
  ])('rejects fractional monetary IDs in %s', async (_name, Dto, payload) => {
    const errors = await validate(Object.assign(new Dto(), payload));
    expect(errors.flatMap((error) => Object.keys(error.constraints ?? {}))).toEqual(expect.arrayContaining(['isInt']));
  });

  it('uses serializable isolation and retries transient write conflicts', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('write conflict', { code: 'P2034', clientVersion: '5.8.1' });
    prisma.$transaction
      .mockRejectedValueOnce(conflict)
      .mockImplementationOnce((callback: any, options: any) => {
        expect(options).toEqual({ isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        return callback(tx);
      });

    await service.addBalance(1, { amount: 10, currencyId: 1 }, 7);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });
});
