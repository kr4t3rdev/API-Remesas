import { PrismaService } from '../database/prisma/prisma.service';
import { FxOperationsService } from '../fx-operations/fx-operations.service';
import { TransactionsService } from './transactions.service';

const USER_A = 101;
const rows = [
  { id: 201, userId: USER_A, currencyId: 3, type: 'COMPRA', operationKind: 'TRANSFER' },
  { id: 203, userId: USER_A, currencyId: 3, type: 'COMPRA', operationKind: 'REMITTANCE' },
  { id: 202, userId: 102, currencyId: 3, type: 'COMPRA', operationKind: 'REMITTANCE' },
];

describe('TransactionsService tenant isolation', () => {
  const setup = () => {
    const transaction = {
      findMany: jest.fn(({ where }: any) => Promise.resolve(rows.filter((row) =>
        row.userId === where.userId
        && (!where.currencyId || row.currencyId === where.currencyId)
        && (!where.type || row.type === where.type)
        && (!where.operationKind || row.operationKind === where.operationKind)))),
      findFirst: jest.fn(({ where }: any) => Promise.resolve(rows.find((row) => row.id === where.id && row.userId === where.userId) ?? null)),
    };
    const fx = { createTransfer: jest.fn().mockResolvedValue({ transaction: rows[0] }) };
    return { transaction, fx, service: new TransactionsService({ transaction } as unknown as PrismaService, fx as unknown as FxOperationsService) };
  };

  it('forwards authenticated userId when creating', async () => {
    const { service, fx } = setup();
    const dto = { type: 'COMPRA', amount: 10, currencyId: 3, rate: 240 } as any;
    await service.create(USER_A, dto);
    expect(fx.createTransfer).toHaveBeenCalledWith(USER_A, dto);
  });

  it('lists only owner A using an exact tenant filter', async () => {
    const { service, transaction } = setup();
    await expect(service.findAll(USER_A, { currencyId: 3 })).resolves.toEqual([rows[0], rows[1]]);
    expect(transaction.findMany).toHaveBeenCalledWith({ where: { userId: USER_A, currencyId: 3 }, include: { currency: true }, orderBy: { createdAt: 'desc' } });
  });

  it('combines operation kind and transaction type within the authenticated tenant', async () => {
    const { service, transaction } = setup();

    await expect(service.findAll(USER_A, {
      type: TransactionType.COMPRA,
      operationKind: FxOperationKind.REMITTANCE,
    })).resolves.toEqual([rows[1]]);
    expect(transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_A,
        type: 'COMPRA',
        operationKind: 'REMITTANCE',
      },
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns owner A and hides user B with a 404', async () => {
    const { service, transaction } = setup();
    await expect(service.findOne(USER_A, 201)).resolves.toEqual(rows[0]);
    await expect(service.findOne(USER_A, 202)).rejects.toMatchObject({ status: 404, message: 'Transacción no encontrada' });
    expect(transaction.findFirst).toHaveBeenNthCalledWith(1, { where: { id: 201, userId: USER_A }, include: { currency: true } });
    expect(transaction.findFirst).toHaveBeenNthCalledWith(2, { where: { id: 202, userId: USER_A }, include: { currency: true } });
  });
});
import { FxOperationKind, TransactionType } from '@prisma/client';
