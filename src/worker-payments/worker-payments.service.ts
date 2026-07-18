import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateWorkerDto, UpdateWorkerDto, CreateTransactionDto, AddBalanceDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WorkerPaymentsService {
  constructor(private prisma: PrismaService) {}

  private async getWorkerCurrencyId(userId: number): Promise<number> {
    const owner = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryCurrencyId: true },
    });

    if (!owner?.primaryCurrencyId) {
      throw new BadRequestException(
        'El propietario del trabajador no tiene una moneda principal configurada',
      );
    }

    return owner.primaryCurrencyId;
  }

  /**
   * Genera las iniciales del trabajador a partir del nombre
   * 2 primeras letras del nombre + 1era letra del apellido
   */
  private generateInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

    const firstPart = firstName.substring(0, 2).toUpperCase();
    const lastPart = lastName.substring(0, 1).toUpperCase();

    return `${firstPart}${lastPart}`;
  }

  async create(createDto: CreateWorkerDto, userId: number) {
    const initials = this.generateInitials(createDto.name);

    return this.prisma.worker.create({
      data: {
        name: createDto.name,
        phone: createDto.phone,
        photoUrl: createDto.photoUrl,
        initials,
        userId,
        balance: new Decimal(0),
        accumulatedProfit: new Decimal(0),
        totalDelivered: new Decimal(0),
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.worker.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const worker = await this.prisma.worker.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!worker) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    return worker;
  }

  async update(id: number, updateDto: UpdateWorkerDto, userId: number) {
    await this.findOne(id, userId);

    const data: any = { ...updateDto };
    if (updateDto.name) {
      data.initials = this.generateInitials(updateDto.name);
    }

    return this.prisma.worker.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.worker.delete({
      where: { id },
    });
  }

  /**
   * Registra una transacción para un trabajador
   * - Resta el monto del saldo del trabajador
   * - Suma la ganancia a accumulatedProfit
   */
  async createTransaction(workerId: number, createDto: CreateTransactionDto, userId: number) {
    const worker = await this.findOne(workerId, userId);
    const currencyId = await this.getWorkerCurrencyId(worker.userId);

    const currentBalance = Number(worker.balance);
    const amount = createDto.amount;
    const profit = createDto.profit;

    const newBalance = currentBalance - amount;
    const newAccumulatedProfit = Number(worker.accumulatedProfit) + profit;

    // Usar transacción de Prisma para garantizar consistencia
    const [transaction, updatedWorker] = await this.prisma.$transaction([
      this.prisma.workerTransaction.create({
        data: {
          workerId,
          currencyId,
          type: 'TRANSACTION',
          amount: new Decimal(amount),
          profit: new Decimal(profit),
          balanceBefore: new Decimal(currentBalance),
          balanceAfter: new Decimal(newBalance),
          description: createDto.description,
        },
      }),
      this.prisma.worker.update({
        where: { id: workerId },
        data: {
          balance: new Decimal(newBalance),
          accumulatedProfit: new Decimal(newAccumulatedProfit),
        },
      }),
    ]);

    return { transaction, worker: updatedWorker };
  }

  /**
   * Agrega saldo a un trabajador
   * - Suma el monto al saldo del trabajador
   * - Suma el monto a totalDelivered
   */
  async addBalance(workerId: number, addDto: AddBalanceDto, userId: number) {
    if (addDto.amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a cero');
    }

    const worker = await this.findOne(workerId, userId);
    const currencyId = await this.getWorkerCurrencyId(worker.userId);

    const currentBalance = Number(worker.balance);
    const currentTotalDelivered = Number(worker.totalDelivered);
    const amount = addDto.amount;

    const newBalance = currentBalance + amount;
    const newTotalDelivered = currentTotalDelivered + amount;

    // Usar transacción de Prisma para garantizar consistencia
    const [transaction, updatedWorker] = await this.prisma.$transaction([
      this.prisma.workerTransaction.create({
        data: {
          workerId,
          currencyId,
          type: 'BALANCE_ADD',
          amount: new Decimal(amount),
          balanceBefore: new Decimal(currentBalance),
          balanceAfter: new Decimal(newBalance),
          description: 'Saldo agregado',
        },
      }),
      this.prisma.worker.update({
        where: { id: workerId },
        data: {
          balance: new Decimal(newBalance),
          totalDelivered: new Decimal(newTotalDelivered),
        },
      }),
    ]);

    return { transaction, worker: updatedWorker };
  }
}
