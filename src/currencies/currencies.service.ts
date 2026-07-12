import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.currency.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async findAllWithPrimary(userId: number) {
    const currencies = await this.prisma.currency.findMany({
      orderBy: { code: 'asc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryCurrencyId: true },
    });

    return {
      currencies,
      primaryCurrencyId: user?.primaryCurrencyId ?? null,
    };
  }

  async findOne(id: number) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Moneda con ID ${id} no encontrada`);
    }

    return currency;
  }

  async create(createCurrencyDto: CreateCurrencyDto) {
    const existing = await this.prisma.currency.findUnique({
      where: { code: createCurrencyDto.code },
    });

    if (existing) {
      if (existing.isActive) {
        throw new BadRequestException(
          `Ya existe una moneda activa con el código '${createCurrencyDto.code}'`
        );
      }

      return this.prisma.currency.update({
        where: { id: existing.id },
        data: { ...createCurrencyDto, isActive: true },
      });
    }

    return this.prisma.currency.create({
      data: createCurrencyDto,
    });
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    await this.findOne(id);

    return this.prisma.currency.update({
      where: { id },
      data: updateCurrencyDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const usersWithPrimary = await this.prisma.user.findMany({
      where: { primaryCurrencyId: id },
    });

    if (usersWithPrimary.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la moneda porque es la moneda principal de ${usersWithPrimary.length} usuario(s)`
      );
    }

    await this.prisma.currency.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Moneda eliminada correctamente' };
  }
}
