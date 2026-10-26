import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { toDecimalString } from '../common/utils/decimal-serialization';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDto: CreateBankAccountDto) {
    return this.prisma.bankAccount.create({
      data: {
        name: createDto.name,
        bankName: createDto.bankName,
        currencyId: createDto.currencyId,
        accountNumber: createDto.accountNumber,
        balance: createDto.initialBalance !== undefined && createDto.initialBalance !== null ? createDto.initialBalance : 0,
        isActive: createDto.isActive ?? true,
        userId,
      },
      include: { currency: true },
    });
  }

  async findAll(userId: number) {
    return this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      include: { currency: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, userId },
      include: { currency: true },
    });

    if (!account) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }

    return account;
  }

  async update(userId: number, id: number, updateDto: UpdateBankAccountDto) {
    await this.findOne(userId, id);

    return this.prisma.bankAccount.update({
      where: { id },
      data: updateDto,
      include: { currency: true },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return this.prisma.bankAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getBalance(userId: number, id: number) {
    const account = await this.findOne(userId, id);
    return {
      id: account.id,
      name: account.name,
      balance: toDecimalString(account.balance),
      currency: account.currency,
    };
  }

  async getTransactions(userId: number, id: number) {
    await this.findOne(userId, id);

    const expenses = await this.prisma.expense.findMany({
      where: { sourceBankAccountId: id, userId },
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });

    const transfers = await this.prisma.transaction.findMany({
      where: { userId, OR: [{ sourceBankAccountId: id }, { destinationBankAccountId: id }] },
      include: { currency: true, sourceBankAccount: true, destinationBankAccount: true },
      orderBy: { createdAt: 'desc' },
    });

    // La pierna CUP no tiene moneda propia (`currency.id = null`), pero el
    // contrato (`BankTransferCurrencyDto`) exige name/symbol/isActive: se
    // completa con la moneda CUP real para que la respuesta cumpla el
    // esquema y los clientes puedan decodificarla.
    const cupCurrency = await this.prisma.currency.findFirst({
      where: { code: 'CUP' },
    });
    const cupLeg = {
      id: null,
      code: 'CUP',
      name: cupCurrency?.name ?? 'Peso Cubano',
      symbol: cupCurrency?.symbol ?? '$',
      isActive: cupCurrency?.isActive ?? true,
    };

    const serializedTransfers = transfers.map((transfer) => {
      const isSource = transfer.sourceBankAccountId === id;
      const amount = transfer.type === 'COMPRA'
        ? (isSource ? toDecimalString(transfer.totalCup) : toDecimalString(transfer.amount))
        : (isSource ? toDecimalString(transfer.amount) : toDecimalString(transfer.totalCup));
      return {
        id: `transfer:${transfer.id}`,
        transactionId: transfer.id,
        type: transfer.type,
        operationKind: transfer.operationKind,
        direction: isSource ? 'OUT' as const : 'IN' as const,
        amount,
        currency: (isSource && transfer.type === 'COMPRA') || (!isSource && transfer.type === 'VENTA')
          ? cupLeg
          : transfer.currency,
        rate: toDecimalString(transfer.rate),
        sourceType: transfer.sourceType,
        destinationType: transfer.destinationType,
        sourceBankAccountId: transfer.sourceBankAccountId,
        destinationBankAccountId: transfer.destinationBankAccountId,
        createdAt: transfer.createdAt,
      };
    });

    return {
      expenses,
      incomes: [],
      transfers: serializedTransfers,
    };
  }
}
