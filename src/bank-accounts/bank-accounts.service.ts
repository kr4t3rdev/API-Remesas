import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
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
      balance: Number(account.balance),
      currency: account.currency,
    };
  }

  async getTransactions(userId: number, id: number) {
    await this.findOne(userId, id);

    const expenseReconciliations = await this.prisma.expenseReconciliation.findMany({
      where: { bankAccountId: id },
      include: { expense: { include: { currency: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const incomeReconciliations = await this.prisma.incomeReconciliation.findMany({
      where: { bankAccountId: id },
      include: { transaction: { include: { currency: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const transfers = await this.prisma.transaction.findMany({
      where: { userId, OR: [{ sourceBankAccountId: id }, { destinationBankAccountId: id }] },
      include: { currency: true, sourceBankAccount: true, destinationBankAccount: true },
      orderBy: { createdAt: 'desc' },
    });

    const serializedTransfers = transfers.map((transfer) => {
      const isSource = transfer.sourceBankAccountId === id;
      const amount = transfer.type === 'COMPRA'
        ? (isSource ? Number(transfer.totalCup) : Number(transfer.amount))
        : (isSource ? Number(transfer.amount) : Number(transfer.totalCup));
      return {
        id: `transfer:${transfer.id}`,
        transactionId: transfer.id,
        type: transfer.type,
        direction: isSource ? 'OUT' as const : 'IN' as const,
        amount,
        currency: isSource && transfer.type === 'COMPRA' ? { code: 'CUP', id: null } : transfer.currency,
        rate: Number(transfer.rate),
        sourceType: transfer.sourceType,
        destinationType: transfer.destinationType,
        sourceBankAccountId: transfer.sourceBankAccountId,
        destinationBankAccountId: transfer.destinationBankAccountId,
        createdAt: transfer.createdAt,
      };
    });

    return {
      expenses: expenseReconciliations,
      incomes: incomeReconciliations,
      transfers: serializedTransfers,
    };
  }
}
