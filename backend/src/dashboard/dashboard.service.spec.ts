import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockContractItem = {
    id: 'item-1',
    contractId: 'c1',
    scheduledDeliveryDate: new Date('2026-03-15'),
    deliveryBlockedReason: null,
    isActive: true,
    contract: {
      contractNumber: 'CTR-001',
      contractSignedAt: new Date(),
      customer: { id: 'cust-1', razaoSocial: 'Cliente Teste', nomeFantasia: null },
    },
    asset: { code: 'EQP-001', assetType: { name: 'Container 20\'' } },
  };

  const mockServiceOrder = {
    id: 'os-1',
    orderNumber: 'OS-2026-0001',
    type: 'INSTALACAO',
    status: 'PENDING',
    scheduledDate: new Date('2026-03-15'),
    contractId: 'c1',
    contract: {
      contractNumber: 'CTR-001',
      customer: { razaoSocial: 'Cliente Teste', nomeFantasia: null },
    },
  };

  beforeEach(async () => {
    const mockPrisma = {
      contractItem: {
        findMany: jest.fn().mockResolvedValue([mockContractItem]),
      },
      serviceOrder: {
        findMany: jest.fn().mockResolvedValue([mockServiceOrder]),
      },
      customer: { count: jest.fn().mockResolvedValue(0) },
      asset: { count: jest.fn().mockResolvedValue(0) },
      contract: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
      vehicle: { count: jest.fn().mockResolvedValue(0) },
      invoice: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
      invoicePayment: { count: jest.fn().mockResolvedValue(0), aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('getExpeditionPanel retorna { items, serviceOrders }', async () => {
    const result = await service.getExpeditionPanel('company-1', {});

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('serviceOrders');
    expect(Array.isArray(result.items)).toBe(true);
    expect(Array.isArray(result.serviceOrders)).toBe(true);
    expect(result.items[0]).toMatchObject({
      id: 'item-1',
      contractNumber: 'CTR-001',
      assetCode: 'EQP-001',
      isBlocked: false,
    });
    expect(result.serviceOrders[0]).toMatchObject({
      orderNumber: 'OS-2026-0001',
      type: 'INSTALACAO',
    });
  });

  it('getExpeditionPanel com filtro start/end', async () => {
    await service.getExpeditionPanel('company-1', {
      start: '2026-03-01',
      end: '2026-03-31',
    });

    expect(prisma.contractItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scheduledDeliveryDate: expect.any(Object),
        }),
      }),
    );
    expect(prisma.serviceOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: 'company-1',
          status: { not: 'CANCELLED' },
        }),
      }),
    );
  });
});
