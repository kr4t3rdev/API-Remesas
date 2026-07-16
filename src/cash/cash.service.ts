import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateCashPolicyDto } from './dto/update-cash-policy.dto';
import { CreateCashClosingDto } from './dto/create-cash-closing.dto';

const toDecimal = (value: unknown) => new Decimal(String(value ?? 0));
const toNumber = (value: unknown) => Number(value ?? 0);

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: number) {
    const [user, balances, currencies, transactions, expenses, adjustments, audits] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, include: { primaryCurrency: true } }),
      this.prisma.cashBalance.findMany({ where: { userId }, include: { currency: true }, orderBy: { currency: { code: 'asc' } } }),
      this.prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } }),
      this.prisma.transaction.findMany({
        where: { userId, OR: [{ sourceType: 'CASH' }, { destinationType: 'CASH' }] },
        include: { currency: true }, orderBy: { createdAt: 'desc' }, take: 20,
      }),
      this.prisma.expense.findMany({
        where: { userId, sourceType: 'CASH' }, include: { currency: true }, orderBy: { createdAt: 'desc' }, take: 20,
      }),
      this.prisma.cashAdjustment.findMany({ where: { userId }, include: { currency: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.cashAudit.findMany({
        where: { userId },
        include: { currency: true, user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const recentMovements = [
      ...transactions.map((transaction) => ({
        id: `transaction:${transaction.id}`,
        kind: 'TRANSACTION' as const,
        type: transaction.type,
        operationKind: transaction.operationKind,
        direction: transaction.sourceType === 'CASH' ? ('OUT' as const) : ('IN' as const),
        title: transaction.type === 'VENTA' ? 'Venta de moneda' : 'Compra de moneda',
        description: `${toNumber(transaction.amount)} ${transaction.currency.code}`,
        amount: toNumber(transaction.amount),
        cashAmount: transaction.sourceType === 'CASH' && transaction.type === 'COMPRA'
          ? toNumber(transaction.totalCup)
          : transaction.destinationType === 'CASH' && transaction.type === 'VENTA'
            ? toNumber(transaction.totalCup)
            : toNumber(transaction.amount),
        totalBase: toNumber(transaction.totalCup),
        sourceType: transaction.sourceType,
        destinationType: transaction.destinationType,
        sourceBankAccountId: transaction.sourceBankAccountId,
        destinationBankAccountId: transaction.destinationBankAccountId,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
      })),
      ...adjustments.map((adjustment) => ({
        id: `adjustment:${adjustment.id}`,
        kind: 'ADJUSTMENT' as const,
        type: adjustment.type,
        direction: adjustment.type === 'INGRESO' ? ('IN' as const) : ('OUT' as const),
        title: adjustment.type === 'INGRESO' ? 'Ingreso manual' : 'Egreso manual',
        description: adjustment.reason,
        amount: toNumber(adjustment.amount),
        totalBase: null,
        currency: adjustment.currency,
        createdAt: adjustment.createdAt,
      })),
      ...expenses.map((expense) => ({
        id: `expense:${expense.id}`,
        kind: 'EXPENSE' as const,
        type: 'EGRESO' as const,
        direction: 'OUT' as const,
        title: expense.description,
        description: expense.category,
        amount: toNumber(expense.amount),
        cashAmount: toNumber(expense.amount),
        totalBase: null,
        currency: expense.currency,
        createdAt: expense.createdAt,
      })),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, 20);

    const latestAudits = audits.reduce<typeof audits>((latest, audit) => {
      if (!latest.some((item) => item.currencyId === audit.currencyId)) latest.push(audit);
      return latest;
    }, []);

    return {
      asOf: new Date().toISOString(),
      primaryCurrency: user?.primaryCurrency ?? null,
      currencies,
      balances: balances.map((balance) => ({ ...balance, balance: toNumber(balance.balance) })),
      recentMovements,
      latestAudits: latestAudits.map((audit) => ({
        ...audit,
        auditorName: audit.user?.name,
        expectedBalance: toNumber(audit.expectedBalance),
        actualBalance: toNumber(audit.actualBalance),
        difference: toNumber(audit.difference),
      })),
    };
  }

  async getPolicies(userId: number) {
    const [currencies, policies] = await Promise.all([
      this.prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } }),
      this.prisma.cashPolicy.findMany({ where: { userId }, include: { currency: true } }),
    ]);
    const policyByCurrency = new Map(policies.map((policy) => [policy.currencyId, policy]));
    return currencies.map((currency) => {
      const policy = policyByCurrency.get(currency.id);
      return {
        currency,
        safetyBuffer: toNumber(policy?.safetyBuffer),
        insuranceLimit: toNumber(policy?.insuranceLimit),
      };
    });
  }

  async updatePolicy(userId: number, currencyId: number, dto: UpdateCashPolicyDto) {
    const currency = await this.prisma.currency.findFirst({ where: { id: currencyId, isActive: true } });
    if (!currency) throw new NotFoundException('Moneda activa no encontrada');

    const policy = await this.prisma.cashPolicy.upsert({
      where: { userId_currencyId: { userId, currencyId } },
      update: { safetyBuffer: toDecimal(dto.safetyBuffer), insuranceLimit: toDecimal(dto.insuranceLimit) },
      create: { userId, currencyId, safetyBuffer: toDecimal(dto.safetyBuffer), insuranceLimit: toDecimal(dto.insuranceLimit) },
      include: { currency: true },
    });
    return { ...policy, safetyBuffer: toNumber(policy.safetyBuffer), insuranceLimit: toNumber(policy.insuranceLimit) };
  }

  async getAuditors(userId: number) {
    // CashAudit currently records the authenticated business owner as its creator.
    // Do not expose every active user in the system as a cross-tenant auditor list.
    return this.prisma.user.findMany({ where: { id: userId, isActive: true }, select: { id: true, name: true } });
  }

  async getClosings(userId: number, currencyId?: number) {
    const closings = await this.prisma.cashClosing.findMany({
      where: { userId, ...(currencyId ? { currencyId } : {}) },
      include: { currency: true, closedBy: { select: { id: true, name: true } } },
      orderBy: [{ businessDate: 'desc' }, { closedAt: 'desc' }],
    });
    return closings.map((closing) => this.serializeClosing(closing));
  }

  async createClosing(userId: number, dto: CreateCashClosingDto) {
    const businessDate = new Date(`${dto.businessDate}T00:00:00.000Z`);
    return this.prisma.$transaction(async (tx) => {
      const currency = await tx.currency.findFirst({ where: { id: dto.currencyId, isActive: true } });
      if (!currency) throw new NotFoundException('Moneda activa no encontrada');
      const balance = await tx.cashBalance.findUnique({ where: { userId_currencyId: { userId, currencyId: dto.currencyId } } });
      const expectedBalance = toDecimal(balance?.balance);
      const actualBalance = toDecimal(dto.actualBalance);
      const existing = await tx.cashClosing.findUnique({
        where: { userId_currencyId_businessDate: { userId, currencyId: dto.currencyId, businessDate } },
        include: { currency: true, closedBy: { select: { id: true, name: true } } },
      });
      if (existing) {
        if (toDecimal(existing.actualBalance).eq(actualBalance) && existing.notes === (dto.notes ?? null)) {
          return this.serializeClosing(existing);
        }
        throw new ConflictException({
          code: 'cash_closing_conflict',
          message: 'Ya existe un cierre para esa moneda y fecha con datos diferentes',
          existingId: existing.id,
        });
      }

      const closing = await tx.cashClosing.create({
        data: {
          userId,
          currencyId: dto.currencyId,
          businessDate,
          expectedBalance,
          actualBalance,
          difference: actualBalance.minus(expectedBalance),
          status: 'CLOSED',
          closedById: userId,
          notes: dto.notes,
        },
        include: { currency: true, closedBy: { select: { id: true, name: true } } },
      });
      return this.serializeClosing(closing);
    });
  }

  async getClosing(userId: number, id: number) {
    const closing = await this.prisma.cashClosing.findFirst({
      where: { id, userId },
      include: { currency: true, closedBy: { select: { id: true, name: true } } },
    });
    if (!closing) throw new NotFoundException('Cierre diario no encontrado');
    return this.serializeClosing(closing);
  }

  async getValuation(userId: number, requestedCurrencyId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { primaryCurrencyId: true } });
    const targetCurrencyId = requestedCurrencyId ?? user?.primaryCurrencyId;
    if (!targetCurrencyId) throw new BadRequestException('No hay moneda destino configurada');
    const [targetCurrency, cupCurrency, balances, rates] = await Promise.all([
      this.prisma.currency.findFirst({ where: { id: targetCurrencyId, isActive: true } }),
      this.prisma.currency.findFirst({ where: { code: 'CUP', isActive: true } }),
      this.prisma.cashBalance.findMany({ where: { userId }, include: { currency: true }, orderBy: { currency: { code: 'asc' } } }),
      this.prisma.exchangeRate.findMany({ where: { userId }, include: { currency: true } }),
    ]);
    if (!targetCurrency) throw new NotFoundException('Moneda destino no encontrada');
    if (!cupCurrency) throw new BadRequestException('Moneda CUP no configurada');

    const rateByCurrency = new Map(rates.map((rate) => [rate.currencyId, toDecimal(rate.referenceRate)]));
    const targetRate = targetCurrencyId === cupCurrency.id ? new Decimal(1) : rateByCurrency.get(targetCurrencyId);
    const missingRates = new Set<string>();
    let total = new Decimal(0);
    const breakdown = balances.map((balance) => {
      const sourceRate = balance.currencyId === cupCurrency.id ? new Decimal(1) : rateByCurrency.get(balance.currencyId);
      let convertedAmount: Decimal | null = null;
      if (balance.currencyId === targetCurrencyId) convertedAmount = toDecimal(balance.balance);
      else if (targetRate && sourceRate) convertedAmount = toDecimal(balance.balance).times(sourceRate).div(targetRate);
      else {
        if (!sourceRate) missingRates.add(balance.currency.code);
        if (!targetRate) missingRates.add(targetCurrency.code);
      }
      if (convertedAmount) total = total.plus(convertedAmount);
      return { currencyId: balance.currencyId, currencyCode: balance.currency.code, amount: toNumber(balance.balance), convertedAmount: convertedAmount ? toNumber(convertedAmount) : null };
    });
    return { total: toNumber(total), targetCurrency, breakdown, missingRates: [...missingRates].sort() };
  }

  private serializeClosing(closing: any) {
    return {
      ...closing,
      expectedBalance: toNumber(closing.expectedBalance),
      actualBalance: toNumber(closing.actualBalance),
      difference: toNumber(closing.difference),
    };
  }
}
