import { validate } from "class-validator";
import { Expo } from "expo-server-sdk";
import { PrismaService } from "../database/prisma/prisma.service";
import { RegisterPushTokenDto } from "./dto/register-push-token.dto";
import { PushNotificationsService } from "./push-notifications.service";

describe("PushNotificationsService", () => {
  let service: PushNotificationsService;
  let prisma: {
    pushDevice: {
      upsert: jest.Mock;
      findMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    pushReceipt: {
      findMany: jest.Mock;
      createMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      pushDevice: {
        upsert: jest.fn().mockResolvedValue({ id: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      pushReceipt: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    service = new PushNotificationsService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("upsert por compound (userId + pushToken) para evitar transferir ownership", async () => {
    await service.upsertDevice(22, {
      pushToken: "ExpoPushToken[device-1]",
      platform: "ios",
    });

    expect(prisma.pushDevice.upsert).toHaveBeenCalledWith({
      where: {
        userId_pushToken: {
          userId: 22,
          pushToken: "ExpoPushToken[device-1]",
        },
      },
      create: {
        userId: 22,
        pushToken: "ExpoPushToken[device-1]",
        platform: "ios",
      },
      update: {
        platform: "ios",
      },
    });
  });

  it("no transfiere el ownership a otro user (upsert compuesto)", async () => {
    // user 99 registra el mismo token: NO debe pisar al user 22.
    await service.upsertDevice(99, {
      pushToken: "ExpoPushToken[device-1]",
      platform: "android",
    });

    expect(prisma.pushDevice.upsert).toHaveBeenCalledWith({
      where: {
        userId_pushToken: {
          userId: 99,
          pushToken: "ExpoPushToken[device-1]",
        },
      },
      create: {
        userId: 99,
        pushToken: "ExpoPushToken[device-1]",
        platform: "android",
      },
      update: {
        platform: "android",
      },
    });
  });

  it("rechaza un token Expo inválido como defensa del service", async () => {
    await expect(
      service.upsertDevice(22, {
        pushToken: "not-a-token",
        platform: "ios",
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(prisma.pushDevice.upsert).not.toHaveBeenCalled();
  });

  it("el DTO rechaza tokens que no son Expo push tokens", async () => {
    const dto = new RegisterPushTokenDto();
    dto.pushToken = "not-a-token";
    dto.platform = "ios";

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: "pushToken" }),
      ]),
    );
  });

  it("elimina únicamente tokens con ticket DeviceNotRegistered", async () => {
    const validToken = "ExpoPushToken[valid-device]";
    const staleToken = "ExpoPushToken[stale-device]";
    const warnSpy = jest.spyOn(
      (service as unknown as { logger: { warn: (message: string) => void } })
        .logger,
      "warn",
    );
    prisma.pushDevice.findMany.mockResolvedValue([
      { pushToken: validToken },
      { pushToken: staleToken },
    ]);
    jest.spyOn(Expo.prototype, "sendPushNotificationsAsync").mockResolvedValue([
      { status: "ok", id: "ticket-1" },
      {
        status: "error",
        message: `Device ${staleToken} is not registered`,
        details: { error: "DeviceNotRegistered" },
      },
    ]);

    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushDevice.deleteMany).toHaveBeenCalledWith({
      where: { pushToken: { in: [staleToken] } },
    });
    expect(warnSpy.mock.calls.flat().join(" ")).not.toContain(staleToken);
  });

  it("no elimina tokens por errores transitorios", async () => {
    prisma.pushDevice.findMany.mockResolvedValue([
      { pushToken: "ExpoPushToken[device-1]" },
    ]);
    jest.spyOn(Expo.prototype, "sendPushNotificationsAsync").mockResolvedValue([
      {
        status: "error",
        message: "Service unavailable",
        details: { error: "MessageRateExceeded" },
      },
    ]);

    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushDevice.deleteMany).not.toHaveBeenCalled();
  });

  it("persiste la correlación de tickets OK para consultar el receipt después", async () => {
    prisma.pushDevice.findMany.mockResolvedValue([
      { pushToken: "ExpoPushToken[device-1]" },
    ]);
    jest.spyOn(Expo.prototype, "sendPushNotificationsAsync").mockResolvedValue([
      { status: "ok", id: "receipt-1" },
    ]);

    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushReceipt.createMany).toHaveBeenCalledWith({
      data: [
        {
          receiptId: "receipt-1",
          pushToken: "ExpoPushToken[device-1]",
        },
      ],
      skipDuplicates: true,
    });
  });

  it("procesa DeviceNotRegistered diferido antes de consultar devices nuevos", async () => {
    const staleToken = "ExpoPushToken[stale-device]";
    prisma.pushReceipt.findMany.mockResolvedValue([
      { receiptId: "receipt-stale", pushToken: staleToken },
    ]);
    prisma.pushDevice.findMany.mockResolvedValue([]);
    jest
      .spyOn(Expo.prototype, "getPushNotificationReceiptsAsync")
      .mockResolvedValue({
        "receipt-stale": {
          status: "error",
          message: "Device is not registered",
          details: { error: "DeviceNotRegistered" },
        },
      });

    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushDevice.deleteMany).toHaveBeenCalledWith({
      where: { pushToken: { in: [staleToken] } },
    });
    expect(prisma.pushReceipt.deleteMany).toHaveBeenCalledWith({
      where: { receiptId: { in: ["receipt-stale"] } },
    });
    expect(
      prisma.pushDevice.deleteMany.mock.invocationCallOrder[0],
    ).toBeLessThan(prisma.pushDevice.findMany.mock.invocationCallOrder[0]);
  });

  it("conserva el receipt pendiente cuando Expo todavía no lo devuelve", async () => {
    prisma.pushReceipt.findMany.mockResolvedValue([
      {
        receiptId: "receipt-pending",
        pushToken: "ExpoPushToken[pending-device]",
      },
    ]);
    jest
      .spyOn(Expo.prototype, "getPushNotificationReceiptsAsync")
      .mockResolvedValue({});

    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushReceipt.deleteMany).not.toHaveBeenCalledWith({
      where: { receiptId: { in: ["receipt-pending"] } },
    });
  });

  it("limpia un receipt con error transitorio sin eliminar el device", async () => {
    prisma.pushReceipt.findMany.mockResolvedValue([
      {
        receiptId: "receipt-transient",
        pushToken: "ExpoPushToken[transient-device]",
      },
    ]);
    jest
      .spyOn(Expo.prototype, "getPushNotificationReceiptsAsync")
      .mockResolvedValue({
        "receipt-transient": {
          status: "error",
          message: "Rate exceeded",
          details: { error: "MessageRateExceeded" },
        },
      });

    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushDevice.deleteMany).not.toHaveBeenCalled();
    expect(prisma.pushReceipt.deleteMany).toHaveBeenCalledWith({
      where: { receiptId: { in: ["receipt-transient"] } },
    });
  });

  it("elimina correlaciones expiradas sin consultar receipts vencidos", async () => {
    await service.sendPushToUser(22, "Title", "Body");

    expect(prisma.pushReceipt.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: expect.any(Date) } },
    });
    expect(prisma.pushReceipt.findMany).toHaveBeenCalledWith({
      where: { createdAt: { gte: expect.any(Date) } },
      select: { receiptId: true, pushToken: true },
    });
  });

  it("no expone el push token al registrar un error de receipt", async () => {
    const staleToken = "ExpoPushToken[secret-device]";
    const warnSpy = jest.spyOn(
      (service as unknown as { logger: { warn: (message: string) => void } })
        .logger,
      "warn",
    );
    prisma.pushReceipt.findMany.mockResolvedValue([
      { receiptId: "receipt-secret", pushToken: staleToken },
    ]);
    jest
      .spyOn(Expo.prototype, "getPushNotificationReceiptsAsync")
      .mockResolvedValue({
        "receipt-secret": {
          status: "error",
          message: "Device is not registered",
          details: {
            error: "DeviceNotRegistered",
            expoPushToken: staleToken,
          },
        },
      });

    await service.sendPushToUser(22, "Title", "Body");

    expect(warnSpy.mock.calls.flat().join(" ")).not.toContain(staleToken);
  });

  describe("removeDevice", () => {
    it("borra el PushDevice del user únicamente cuando coincide userId y pushToken", async () => {
      await service.removeDevice(22, {
        pushToken: "ExpoPushToken[device-1]",
      });

      expect(prisma.pushDevice.deleteMany).toHaveBeenCalledWith({
        where: { userId: 22, pushToken: "ExpoPushToken[device-1]" },
      });
    });

    it("rechaza tokens Expo inválidos", async () => {
      await expect(
        service.removeDevice(22, { pushToken: "not-a-token" }),
      ).rejects.toMatchObject({ status: 400 });

      expect(prisma.pushDevice.deleteMany).not.toHaveBeenCalled();
    });

    it("no borra tokens ajenos (otro user)", async () => {
      prisma.pushDevice.deleteMany.mockResolvedValue({ count: 0 });

      await service.removeDevice(99, {
        pushToken: "ExpoPushToken[device-1]",
      });

      expect(prisma.pushDevice.deleteMany).toHaveBeenCalledWith({
        where: { userId: 99, pushToken: "ExpoPushToken[device-1]" },
      });
    });
  });
});
