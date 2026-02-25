import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ObjectivesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateObjectiveDto, userId: number) {
    return this.prisma.objective.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        targetAmount: new Decimal(createDto.targetAmount),
        currencyId: createDto.currencyId,
        bankAccountId: createDto.bankAccountId,
        userId,
      },
      include: { currency: true, bankAccount: true },
    });
  }

  async findAll(userId: number, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.objective.findMany({
      where,
      include: { currency: true, bankAccount: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const objective = await this.prisma.objective.findFirst({
      where: { id, userId },
      include: { currency: true, bankAccount: true },
    });

    if (!objective) {
      throw new NotFoundException('Objetivo no encontrado');
    }

    return objective;
  }

  async update(id: number, updateDto: UpdateObjectiveDto, userId: number) {
    await this.findOne(id, userId);

    const data: any = { ...updateDto };
    if (updateDto.targetAmount) {
      data.targetAmount = new Decimal(updateDto.targetAmount);
    }

    return this.prisma.objective.update({
      where: { id },
      data,
      include: { currency: true, bankAccount: true },
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateStatusDto, userId: number) {
    await this.findOne(id, userId);

    const data: any = { status: updateStatusDto.status };

    if (updateStatusDto.status === 'COMPLETADO') {
      data.completedAt = new Date();
    }

    return this.prisma.objective.update({
      where: { id },
      data,
      include: { currency: true, bankAccount: true },
    });
  }

  async updateProgress(id: number, amount: number, userId: number) {
    const objective = await this.findOne(id, userId);

    const newAmount = Number(objective.currentAmount) + amount;
    const status = newAmount >= Number(objective.targetAmount) ? 'COMPLETADO' : objective.status;
    const completedAt = status === 'COMPLETADO' ? new Date() : objective.completedAt;

    return this.prisma.objective.update({
      where: { id },
      data: {
        currentAmount: new Decimal(newAmount),
        status: status as any,
        completedAt,
      },
      include: { currency: true, bankAccount: true },
    });
  }

  async getProgress(id: number, userId: number) {
    const objective = await this.findOne(id, userId);

    const targetAmount = Number(objective.targetAmount);
    const currentAmount = Number(objective.currentAmount);
    const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    return {
      ...objective,
      targetAmount,
      currentAmount,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(targetAmount - currentAmount, 0),
    };
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.objective.delete({
      where: { id },
    });
  }
}
