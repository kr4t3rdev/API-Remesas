import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateWorkerDto, UpdateWorkerDto, CreateTransactionDto, AddBalanceDto, DepositDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';
import { serializableTransaction } from '../common/transactions/serializable-transaction';

@Injectable()
export class WorkerPaymentsService {
  constructor(private prisma: PrismaService) {}

  private generateInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    return `${firstName.substring(0, 2).toUpperCase()}${lastName.substring(0, 1).toUpperCase()}`;
  }

  async create(createDto: CreateWorkerDto, userId: number) {
    return this.prisma.worker.create({
      data: { ...createDto, initials: this.generateInitials(createDto.name), userId, balance: 0, accumulatedProfit: 0, totalDelivered: 0 },
      include: { balances: true },
    });
  }

  async findAll(userId: number) {
    return this.prisma.worker.findMany({ where: { userId }, include: { balances: { include: { currency: true } }, transactions: { include: { currency: true }, orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number, userId: number) {
    const worker = await this.prisma.worker.findFirst({ where: { id, userId }, include: { balances: { include: { currency: true } }, transactions: { include: { currency: true }, orderBy: { createdAt: 'desc' } } } });
    if (!worker) throw new NotFoundException('Trabajador no encontrado');
    return worker;
  }

  private async getWorkerBalance(workerId: number, currencyId: number | undefined, userId: number, tx: any = this.prisma) {
    if (!currencyId) throw new BadRequestException('La moneda es obligatoria');
    const worker = await tx.worker.findFirst({ where: { id: workerId, userId }, select: { id: true } });
    if (!worker) throw new NotFoundException('Trabajador no encontrado');
    const currency = await tx.currency.findFirst({ where: { id: currencyId, isActive: true }, select: { id: true } });
    if (!currency) throw new BadRequestException('La moneda no existe o está inactiva');
    return tx.workerBalance.upsert({ where: { workerId_currencyId: { workerId, currencyId } }, create: { workerId, currencyId, balance: 0, accumulatedProfit: 0, totalDelivered: 0 }, update: {} });
  }

  async update(id: number, updateDto: UpdateWorkerDto, userId: number) {
    await this.findOne(id, userId);
    const data: any = { ...updateDto };
    if (updateDto.name) data.initials = this.generateInitials(updateDto.name);
    return this.prisma.worker.update({ where: { id }, data });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.worker.delete({ where: { id } });
  }

  private validateSelection(type: string | undefined, id: number | undefined, currencyId: number | undefined, label: string) {
    if (!currencyId) throw new BadRequestException(`${label}: moneda requerida`);
    // An identifier without a selection is ambiguous and must never be silently ignored.
    // This also protects callers that bypass class-validator (e.g. internal jobs/tests).
    if (!type) {
      if (id !== undefined) throw new BadRequestException(`${label}: el id requiere un tipo`);
      return;
    }
    if (type !== 'CASH' && type !== 'BANK_ACCOUNT') throw new BadRequestException(`${label}: tipo inválido`);
    if (type === 'BANK_ACCOUNT' && id === undefined) throw new BadRequestException(`${label}: cuenta bancaria requerida`);
    if (type === 'CASH' && id !== undefined) throw new BadRequestException(`${label}: id no permitido para caja`);
  }

  private async validateSource(dto: AddBalanceDto, userId: number, amount: number, tx: any = this.prisma) {
    this.validateSelection(dto.sourceType, dto.sourceId, dto.currencyId, 'Origen');
    if (!dto.sourceType) return null;
    if (dto.sourceType === 'CASH') {
      const cash = await tx.cashBalance.findUnique({ where: { userId_currencyId: { userId, currencyId: dto.currencyId! } } });
      if (!cash) throw new BadRequestException('Caja no encontrada');
      if (Number(cash.balance) < amount) throw new BadRequestException('Saldo insuficiente en caja');
      return { kind: 'CASH' as const, record: cash };
    }
    const account = await tx.bankAccount.findFirst({ where: { id: dto.sourceId!, userId } });
    if (!account) throw new BadRequestException('Cuenta bancaria no encontrada');
    if (!account.isActive) throw new BadRequestException('La cuenta bancaria no está activa');
    if (account.currencyId !== dto.currencyId) throw new BadRequestException('La moneda de la cuenta no coincide');
    if (Number(account.balance) < amount) throw new BadRequestException('Saldo insuficiente en la cuenta bancaria');
    return { kind: 'BANK_ACCOUNT' as const, record: account };
  }

  private async validateDestination(type: string | undefined, id: number | undefined, currencyId: number | undefined, userId: number, tx: any = this.prisma) {
    this.validateSelection(type, id, currencyId, 'Destino');
    if (!type) return null;
    if (type === 'CASH') {
      const cash = await tx.cashBalance.findUnique({ where: { userId_currencyId: { userId, currencyId: currencyId! } } });
      if (!cash) throw new BadRequestException('Caja no encontrada');
      return { kind: 'CASH' as const, record: cash };
    }
    const account = await tx.bankAccount.findFirst({ where: { id: id!, userId } });
    if (!account) throw new BadRequestException('Cuenta bancaria no encontrada');
    if (!account.isActive) throw new BadRequestException('La cuenta bancaria no está activa');
    if (account.currencyId !== currencyId) throw new BadRequestException('La moneda de la cuenta no coincide');
    return { kind: 'BANK_ACCOUNT' as const, record: account };
  }

  async addBalance(workerId: number, dto: AddBalanceDto, userId: number) {
    if (dto.amount <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
    this.validateSelection(dto.sourceType, dto.sourceId, dto.currencyId, 'Origen');
    return serializableTransaction(this.prisma, async (tx: any) => {
      const balance = await this.getWorkerBalance(workerId, dto.currencyId, userId, tx);
      const source = await this.validateSource(dto, userId, dto.amount, tx);
      const before = Number(balance.balance); const after = before + dto.amount;
      const transaction = await tx.workerTransaction.create({ data: { workerId, currencyId: dto.currencyId!, type: 'BALANCE_ADD', amount: new Decimal(dto.amount), balanceBefore: new Decimal(before), balanceAfter: new Decimal(after), description: dto.sourceType ? `Saldo agregado desde ${dto.sourceType === 'CASH' ? 'Caja' : 'Cuenta bancaria'}` : 'Saldo agregado' } });
      const updatedBalance = await tx.workerBalance.update({ where: { id: balance.id }, data: { balance: new Decimal(after), totalDelivered: { increment: new Decimal(dto.amount) } } });
      if (source?.kind === 'CASH') await tx.cashBalance.update({ where: { userId_currencyId: { userId, currencyId: dto.currencyId! } }, data: { balance: { decrement: new Decimal(dto.amount) } } });
      if (source?.kind === 'BANK_ACCOUNT') await tx.bankAccount.update({ where: { id: dto.sourceId! }, data: { balance: { decrement: new Decimal(dto.amount) } } });
      return { transaction, workerBalance: updatedBalance };
    });
  }

  async deposit(workerId: number, dto: DepositDto, userId: number) {
    if (dto.amount <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
    return serializableTransaction(this.prisma, async (tx: any) => {
      const balance = await this.getWorkerBalance(workerId, dto.currencyId, userId, tx);
      const destination = await this.validateDestination(dto.destinationType, dto.destinationId, dto.currencyId, userId, tx);
      const before = Number(balance.balance); if (before < dto.amount) throw new BadRequestException('Saldo insuficiente del trabajador');
      const transaction = await tx.workerTransaction.create({ data: { workerId, currencyId: dto.currencyId, type: 'TRANSACTION', amount: new Decimal(dto.amount), balanceBefore: new Decimal(before), balanceAfter: new Decimal(before - dto.amount), description: dto.destinationType ? `Depósito a ${dto.destinationType === 'CASH' ? 'Caja' : 'Cuenta bancaria'}` : 'Depósito' } });
      const updatedBalance = await tx.workerBalance.update({ where: { id: balance.id }, data: { balance: { decrement: new Decimal(dto.amount) } } });
      if (destination?.kind === 'CASH') await tx.cashBalance.update({ where: { userId_currencyId: { userId, currencyId: dto.currencyId! } }, data: { balance: { increment: new Decimal(dto.amount) } } });
      if (destination?.kind === 'BANK_ACCOUNT') await tx.bankAccount.update({ where: { id: dto.destinationId! }, data: { balance: { increment: new Decimal(dto.amount) } } });
      return { transaction, workerBalance: updatedBalance };
    });
  }

  async createTransaction(workerId: number, dto: CreateTransactionDto, userId: number) {
    if (dto.amount <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
    return serializableTransaction(this.prisma, async (tx: any) => {
      const balance = await this.getWorkerBalance(workerId, dto.currencyId, userId, tx);
      const destination = await this.validateDestination(dto.destinationType, dto.destinationId, dto.currencyId, userId, tx);
      const before = Number(balance.balance); if (before < dto.amount) throw new BadRequestException('Saldo insuficiente del trabajador');
      const transaction = await tx.workerTransaction.create({ data: { workerId, currencyId: dto.currencyId, type: 'TRANSACTION', amount: new Decimal(dto.amount), profit: new Decimal(dto.profit), balanceBefore: new Decimal(before), balanceAfter: new Decimal(before - dto.amount), description: dto.description } });
      const updatedBalance = await tx.workerBalance.update({ where: { id: balance.id }, data: { balance: { decrement: new Decimal(dto.amount) }, accumulatedProfit: { increment: new Decimal(dto.profit) } } });
      if (destination?.kind === 'CASH') await tx.cashBalance.update({ where: { userId_currencyId: { userId, currencyId: dto.currencyId! } }, data: { balance: { increment: new Decimal(dto.amount) } } });
      if (destination?.kind === 'BANK_ACCOUNT') await tx.bankAccount.update({ where: { id: dto.destinationId! }, data: { balance: { increment: new Decimal(dto.amount) } } });
      return { transaction, workerBalance: updatedBalance };
    });
  }
}
