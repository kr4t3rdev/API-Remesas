import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  create(dto: CreatePlanDto) {
    // Los precios entran como decimal string y se persisten como Decimal
    // (sin pasar por float). Los derivados usan aritmética decimal exacta.
    const monthlyUsd = new Decimal(dto.monthlyUsd);
    return this.prisma.plan.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        monthlyUsd,
        semiannualUsd:
          dto.semiannualUsd !== undefined
            ? new Decimal(dto.semiannualUsd)
            : monthlyUsd.mul(6).toDecimalPlaces(2),
        annualUsd:
          dto.annualUsd !== undefined
            ? new Decimal(dto.annualUsd)
            : monthlyUsd.mul(12).toDecimalPlaces(2),
      },
    });
  }

  async update(id: number, dto: UpdatePlanDto) {
    await this.findOne(id);
    const data: any = { ...dto };

    if (typeof data.monthlyUsd === 'string') {
      const monthlyUsd = new Decimal(data.monthlyUsd);
      if (typeof data.semiannualUsd !== 'string') {
        data.semiannualUsd = monthlyUsd.mul(6).toDecimalPlaces(2);
      }
      if (typeof data.annualUsd !== 'string') {
        data.annualUsd = monthlyUsd.mul(12).toDecimalPlaces(2);
      }
    }

    if (typeof data.monthlyUsd === 'string') data.monthlyUsd = new Decimal(data.monthlyUsd);
    if (typeof data.semiannualUsd === 'string') data.semiannualUsd = new Decimal(data.semiannualUsd);
    if (typeof data.annualUsd === 'string') data.annualUsd = new Decimal(data.annualUsd);

    return this.prisma.plan.update({ where: { id }, data });
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
    return this.prisma.plan.delete({ where: { id } });
  }
}
