import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

const FIXED_PRICING = {
  monthlyUsd: 15,
  semiannualUsd: 85.5,
  annualUsd: 162,
};

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  private validatePricing(payload: Partial<CreatePlanDto>) {
    const monthly = payload.monthlyUsd ?? FIXED_PRICING.monthlyUsd;
    const semiannual = payload.semiannualUsd ?? FIXED_PRICING.semiannualUsd;
    const annual = payload.annualUsd ?? FIXED_PRICING.annualUsd;

    if (monthly !== FIXED_PRICING.monthlyUsd || semiannual !== FIXED_PRICING.semiannualUsd || annual !== FIXED_PRICING.annualUsd) {
      throw new BadRequestException('Pricing inválido. Debe ser 15 (mensual), 85.50 (semestral), 162 (anual).');
    }
  }

  findAll() {
    return this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  create(dto: CreatePlanDto) {
    this.validatePricing(dto);
    return this.prisma.plan.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        monthlyUsd: dto.monthlyUsd ?? FIXED_PRICING.monthlyUsd,
        semiannualUsd: dto.semiannualUsd ?? FIXED_PRICING.semiannualUsd,
        annualUsd: dto.annualUsd ?? FIXED_PRICING.annualUsd,
      },
    });
  }

  async update(id: number, dto: UpdatePlanDto) {
    await this.findOne(id);
    this.validatePricing(dto);
    return this.prisma.plan.update({ where: { id }, data: dto });
  }
}
