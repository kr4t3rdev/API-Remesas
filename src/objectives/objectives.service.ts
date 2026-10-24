import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma/prisma.service";
import { toDecimalString } from "../common/utils/decimal-serialization";
import { CreateObjectiveDto } from "./dto/create-objective.dto";
import { UpdateObjectiveDto } from "./dto/update-objective.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class ObjectivesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateObjectiveDto, userId: number) {
    await this.assertBankAccountOwnership(createDto.bankAccountId, userId);

    return this.prisma.objective.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        targetAmount: new Decimal(createDto.targetAmount),
        currencyId: createDto.currencyId,
        bankAccountId: createDto.bankAccountId,
        userId,
      },
      include: this.tenantSafeInclude(userId),
    });
  }

  async findAll(userId: number, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.objective.findMany({
      where,
      include: this.tenantSafeInclude(userId),
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, userId: number) {
    const objective = await this.prisma.objective.findFirst({
      where: { id, userId },
      include: this.tenantSafeInclude(userId),
    });

    if (!objective) {
      throw new NotFoundException("Objetivo no encontrado");
    }

    return objective;
  }

  async update(id: number, updateDto: UpdateObjectiveDto, userId: number) {
    await this.findOne(id, userId);
    await this.assertBankAccountOwnership(updateDto.bankAccountId, userId);

    const data: any = { ...updateDto };
    if (updateDto.targetAmount) {
      data.targetAmount = new Decimal(updateDto.targetAmount);
    }

    return this.prisma.objective.update({
      where: { id, userId },
      data,
      include: this.tenantSafeInclude(userId),
    });
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateStatusDto,
    userId: number,
  ) {
    await this.findOne(id, userId);

    const data: any = { status: updateStatusDto.status };

    if (updateStatusDto.status === "COMPLETADO") {
      data.completedAt = new Date();
    }

    return this.prisma.objective.update({
      where: { id, userId },
      data,
      include: this.tenantSafeInclude(userId),
    });
  }

  async updateProgress(id: number, amount: number, userId: number) {
    const objective = await this.findOne(id, userId);

    const newAmount = Number(objective.currentAmount) + amount;
    const status =
      newAmount >= Number(objective.targetAmount)
        ? "COMPLETADO"
        : objective.status;
    const completedAt =
      status === "COMPLETADO" ? new Date() : objective.completedAt;

    return this.prisma.objective.update({
      where: { id, userId },
      data: {
        currentAmount: new Decimal(newAmount),
        status: status as any,
        completedAt,
      },
      include: this.tenantSafeInclude(userId),
    });
  }

  async getProgress(id: number, userId: number) {
    const objective = await this.findOne(id, userId);

    const targetAmount = new Decimal(String(objective.targetAmount ?? 0));
    const currentAmount = new Decimal(String(objective.currentAmount ?? 0));
    const percentage =
      targetAmount.gt(0) ? Number(currentAmount.div(targetAmount).mul(100)) : 0;

    return {
      ...objective,
      targetAmount: toDecimalString(targetAmount),
      currentAmount: toDecimalString(currentAmount),
      percentage: Math.min(percentage, 100),
      remaining: toDecimalString(Decimal.max(targetAmount.minus(currentAmount), 0)),
    };
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.objective.delete({
      where: { id, userId },
    });
  }

  private async assertBankAccountOwnership(
    bankAccountId: number | null | undefined,
    userId: number,
  ) {
    if (bankAccountId == null) return;

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
      select: { id: true },
    });

    if (!bankAccount) {
      throw new NotFoundException("Cuenta bancaria no encontrada");
    }
  }

  private tenantSafeInclude(userId: number) {
    return {
      currency: true,
      bankAccount: { where: { userId } },
    };
  }
}
