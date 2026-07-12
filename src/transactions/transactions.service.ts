import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { ReconciliationsService } from '../reconciliations/reconciliations.service';
import { FxOperationsService } from '../fx-operations/fx-operations.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ReconciliationsService))
    private reconciliationsService: ReconciliationsService,
    private fxOperationsService: FxOperationsService,
  ) {}

  async create(userId: number, createDto: CreateTransactionDto) {
    const result = await this.fxOperationsService.createTransfer(userId, createDto);
    if (createDto.bankAccountId) {
      await this.reconciliationsService.reconcileIncomeWithTransaction(
        { transactionId: result.transaction.id, bankAccountId: createDto.bankAccountId, amount: createDto.amount },
        userId,
      );
    }
    return result.transaction;
  }

  async findAll(userId: number, query: QueryTransactionDto) {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.currencyId) where.currencyId = query.currencyId;
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    return this.prisma.transaction.findMany({
      where,
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId, status: 'PENDIENTE' },
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { currency: true, incomeReconciliation: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }
}
