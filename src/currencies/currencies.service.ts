import { Injectable, NotFoundException } from '@nestjs/common';
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
}
