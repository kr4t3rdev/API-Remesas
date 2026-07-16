import { NotFoundException } from "@nestjs/common";
import { ObjectivesService } from "./objectives.service";

describe("ObjectivesService tenant isolation", () => {
  const prisma: any = {
    objective: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bankAccount: {
      findFirst: jest.fn(),
    },
  };

  const service = new ObjectivesService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.objective.findFirst.mockResolvedValue({
      id: 10,
      userId: 7,
      targetAmount: 100,
      currentAmount: 0,
      status: "ACTIVO",
    });
  });

  it("rejects create when the bank account does not belong to the tenant", async () => {
    prisma.bankAccount.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        { name: "Goal", targetAmount: 100, currencyId: 1, bankAccountId: 99 },
        7,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.bankAccount.findFirst).toHaveBeenCalledWith({
      where: { id: 99, userId: 7 },
      select: { id: true },
    });
    expect(prisma.objective.create).not.toHaveBeenCalled();
  });

  it("uses the same error for a foreign and a nonexistent bank account", async () => {
    prisma.bankAccount.findFirst.mockResolvedValue(null);
    const input = { name: "Goal", targetAmount: 100, currencyId: 1 };

    const foreign = service.create({ ...input, bankAccountId: 99 }, 7);
    await expect(foreign).rejects.toMatchObject({
      response: { message: "Cuenta bancaria no encontrada" },
    });

    const nonexistent = service.create({ ...input, bankAccountId: 404 }, 7);
    await expect(nonexistent).rejects.toMatchObject({
      response: { message: "Cuenta bancaria no encontrada" },
    });
  });

  it("creates an objective with a bank account owned by the tenant", async () => {
    prisma.bankAccount.findFirst.mockResolvedValue({ id: 20 });
    prisma.objective.create.mockResolvedValue({ id: 1, bankAccountId: 20 });

    await service.create(
      { name: "Goal", targetAmount: 100, currencyId: 1, bankAccountId: 20 },
      7,
    );

    expect(prisma.objective.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bankAccountId: 20, userId: 7 }),
      }),
    );
  });

  it("rejects update when the bank account does not belong to the tenant", async () => {
    prisma.bankAccount.findFirst.mockResolvedValue(null);

    await expect(service.update(10, { bankAccountId: 99 }, 7)).rejects.toThrow(
      NotFoundException,
    );

    expect(prisma.bankAccount.findFirst).toHaveBeenCalledWith({
      where: { id: 99, userId: 7 },
      select: { id: true },
    });
    expect(prisma.objective.update).not.toHaveBeenCalled();
  });

  it("updates an objective with a bank account owned by the tenant", async () => {
    prisma.bankAccount.findFirst.mockResolvedValue({ id: 20 });
    prisma.objective.update.mockResolvedValue({ id: 10, bankAccountId: 20 });

    await service.update(10, { bankAccountId: 20 }, 7);

    expect(prisma.objective.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10, userId: 7 },
        data: expect.objectContaining({ bankAccountId: 20 }),
      }),
    );
  });

  it("allows an update that does not change the bank account", async () => {
    prisma.objective.update.mockResolvedValue({ id: 10, name: "Updated" });

    await service.update(10, { name: "Updated" }, 7);

    expect(prisma.bankAccount.findFirst).not.toHaveBeenCalled();
    expect(prisma.objective.update).toHaveBeenCalled();
  });

  it("allows explicitly removing the bank account association", async () => {
    prisma.objective.update.mockResolvedValue({ id: 10, bankAccountId: null });

    await service.update(10, { bankAccountId: null } as any, 7);

    expect(prisma.bankAccount.findFirst).not.toHaveBeenCalled();
    expect(prisma.objective.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bankAccountId: null }),
      }),
    );
  });

  it("filters included bank account data by the requesting tenant", async () => {
    await service.findOne(10, 7);

    expect(prisma.objective.findFirst).toHaveBeenCalledWith({
      where: { id: 10, userId: 7 },
      include: {
        currency: true,
        bankAccount: { where: { userId: 7 } },
      },
    });
  });

  it("filters bank account includes in lists and mutation responses", async () => {
    prisma.objective.findMany.mockResolvedValue([]);
    prisma.objective.update.mockResolvedValue({ id: 10 });

    await service.findAll(7);
    await service.updateStatus(10, { status: "ACTIVO" } as any, 7);

    const include = {
      currency: true,
      bankAccount: { where: { userId: 7 } },
    };
    expect(prisma.objective.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include }),
    );
    expect(prisma.objective.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10, userId: 7 }, include }),
    );
  });

  it("keeps the tenant predicate on progress updates and deletion", async () => {
    prisma.objective.update.mockResolvedValue({ id: 10 });
    prisma.objective.delete.mockResolvedValue({ id: 10 });

    await service.updateProgress(10, 5, 7);
    await service.remove(10, 7);

    expect(prisma.objective.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10, userId: 7 } }),
    );
    expect(prisma.objective.delete).toHaveBeenCalledWith({
      where: { id: 10, userId: 7 },
    });
  });
});
