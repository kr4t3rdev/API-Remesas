import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseItemsService } from './expense-items.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ExpenseItemsService', () => {
  let service: ExpenseItemsService;
  let prisma: any;

  const mockExpenseItem = {
    id: 1,
    userId: 1,
    name: 'Arrendamientos de Inmuebles',
    amount: { toString: () => '5000.00' },
    category: 'Inmuebles',
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-20'),
  };

  beforeEach(async () => {
    const mockPrisma = {
      expenseItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseItemsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpenseItemsService>(ExpenseItemsService);
    prisma = module.get(PrismaService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un gasto exitosamente', async () => {
      const createDto = {
        name: 'Arrendamientos de Inmuebles',
        amount: 5000,
        category: 'Inmuebles',
      };

      prisma.expenseItem.create.mockResolvedValue({
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto, 1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(prisma.expenseItem.create).toHaveBeenCalledWith({
        data: {
          name: 'Arrendamientos de Inmuebles',
          amount: expect.anything(),
          category: 'Inmuebles',
          userId: 1,
        },
      });
    });

    it('debería crear un gasto sin categoría', async () => {
      const createDto = {
        name: 'Telefonía',
        amount: 360,
      };

      prisma.expenseItem.create.mockResolvedValue({
        id: 2,
        ...createDto,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto, 1);

      expect(result.category).toBeNull();
    });

    it('debería redondear monto a 2 decimales', async () => {
      const createDto = {
        name: 'Test',
        amount: 100.999,
      };

      prisma.expenseItem.create.mockResolvedValue({
        id: 3,
        ...createDto,
        amount: { toString: () => '101.00' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(createDto, 1);

      expect(prisma.expenseItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: expect.anything(),
          }),
        })
      );
    });
  });

  describe('findAll', () => {
    it('debería listar todos los gastos ordenados por fecha descendente', async () => {
      const items = [
        { ...mockExpenseItem, id: 1, name: 'Gasto 1' },
        { ...mockExpenseItem, id: 2, name: 'Gasto 2' },
      ];

      prisma.expenseItem.findMany.mockResolvedValue(items);

      const result = await service.findAll({}, 1);

      expect(result).toHaveLength(2);
      expect(prisma.expenseItem.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería filtrar por categoría', async () => {
      prisma.expenseItem.findMany.mockResolvedValue([mockExpenseItem]);

      await service.findAll({ category: 'Inmuebles' }, 1);

      expect(prisma.expenseItem.findMany).toHaveBeenCalledWith({
        where: { userId: 1, category: 'Inmuebles' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('debería obtener un gasto por ID', async () => {
      prisma.expenseItem.findFirst.mockResolvedValue(mockExpenseItem);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockExpenseItem);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      prisma.expenseItem.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar un gasto', async () => {
      const updateDto = {
        name: 'Mantenimiento de Inmuebles',
        amount: 3500,
      };

      prisma.expenseItem.findFirst.mockResolvedValue(mockExpenseItem);
      prisma.expenseItem.update.mockResolvedValue({
        ...mockExpenseItem,
        ...updateDto,
      });

      const result = await service.update(1, updateDto, 1);

      expect(result.name).toBe('Mantenimiento de Inmuebles');
      expect(prisma.expenseItem.update).toHaveBeenCalled();
    });

    it('debería permitir eliminar categoría (null)', async () => {
      prisma.expenseItem.findFirst.mockResolvedValue(mockExpenseItem);
      prisma.expenseItem.update.mockResolvedValue({
        ...mockExpenseItem,
        category: null,
      });

      await service.update(1, { category: null }, 1);

      expect(prisma.expenseItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { category: null },
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un gasto', async () => {
      prisma.expenseItem.findFirst.mockResolvedValue(mockExpenseItem);
      prisma.expenseItem.delete.mockResolvedValue(mockExpenseItem);

      const result = await service.remove(1, 1);

      expect(result).toEqual(mockExpenseItem);
      expect(prisma.expenseItem.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getReport', () => {
    it('debería generar reporte mensual', async () => {
      const items = [
        { ...mockExpenseItem, amount: { toString: () => '1000.00' } },
        { ...mockExpenseItem, id: 2, amount: { toString: () => '2000.00' } },
      ];

      prisma.expenseItem.findMany.mockResolvedValue(items);

      const result = await service.getReport('month', 1, '2026-03');

      expect(result.count).toBe(2);
      expect(result.total).toBe(3000);
      expect(result.average).toBe(1500);
    });

    it('debería generar reporte trimestral', async () => {
      prisma.expenseItem.findMany.mockResolvedValue([mockExpenseItem]);

      const result = await service.getReport('quarter', 1, '2026-Q1');

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
    });

    it('debería lanzar error para período inválido', async () => {
      await expect(service.getReport('invalid' as any, 1)).rejects.toThrow(BadRequestException);
    });

    it('debería generar reporte de todos los gastos', async () => {
      prisma.expenseItem.findMany.mockResolvedValue([mockExpenseItem]);

      const result = await service.getReport('all', 1);

      expect(result.count).toBe(1);
      expect(result.period).toBeUndefined();
    });

    it('debería lanzar error para período inválido', async () => {
      await expect(service.getReport('invalid', 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCategories', () => {
    it('debería retornar categorías únicas usadas', async () => {
      prisma.expenseItem.findMany.mockResolvedValue([
        { category: 'Inmuebles' },
        { category: 'Servicios' },
      ]);

      const result = await service.getCategories(1);

      expect(result).toContain('Inmuebles');
      expect(result).toContain('Servicios');
      expect(result).toHaveLength(2);
    });

    it('debería filtrar categorías null', async () => {
      prisma.expenseItem.findMany.mockResolvedValue([
        { category: 'Inmuebles' },
        { category: null },
      ]);

      const result = await service.getCategories(1);

      expect(result).not.toContain(null);
    });
  });
});
