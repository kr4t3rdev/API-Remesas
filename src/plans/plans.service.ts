import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Plan } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Money convention of the API contract: prices are JSON numbers.
   * Prisma Decimal columns serialize as strings, so convert at the
   * boundary (same pattern as bank-accounts/cash-balances balances).
   */
  private toResponse(plan: Plan) {
    return {
      ...plan,
      monthlyUsd: plan.monthlyUsd.toNumber(),
      semiannualUsd: plan.semiannualUsd.toNumber(),
      annualUsd: plan.annualUsd.toNumber(),
    };
  }

  async findAll() {
    const plans = await this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    return plans.map((plan) => this.toResponse(plan));
  }

  async findOne(id: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return this.toResponse(plan);
  }

  async create(dto: CreatePlanDto) {
    const monthlyUsd = dto.monthlyUsd;
    const plan = await this.prisma.plan.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        monthlyUsd,
        semiannualUsd: dto.semiannualUsd ?? Number((monthlyUsd * 6).toFixed(2)),
        annualUsd: dto.annualUsd ?? Number((monthlyUsd * 12).toFixed(2)),
      },
    });
    return this.toResponse(plan);
  }

  async update(id: number, dto: UpdatePlanDto) {
    await this.findOne(id);
    const data = { ...dto } as UpdatePlanDto;

    if (typeof data.monthlyUsd === 'number') {
      if (typeof data.semiannualUsd !== 'number') data.semiannualUsd = Number((data.monthlyUsd * 6).toFixed(2));
      if (typeof data.annualUsd !== 'number') data.annualUsd = Number((data.monthlyUsd * 12).toFixed(2));
    }

    const plan = await this.prisma.plan.update({ where: { id }, data });
    return this.toResponse(plan);
  }

  async delete(id: number) {
    await this.findOne(id);
    // Check for ANY license (active OR expired) - blocking ANY prevents orphaned records
    const existingLicenses = await this.prisma.userLicense.findFirst({
      where: { planId: id },
    });
    if (existingLicenses) {
      throw new BadRequestException('No se puede eliminar un plan con licencias existentes.');
    }
    const plan = await this.prisma.plan.delete({ where: { id } });
    return this.toResponse(plan);
  }
}
