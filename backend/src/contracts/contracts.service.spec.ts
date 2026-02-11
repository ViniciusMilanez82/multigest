import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContractsService', () => {
  let service: ContractsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      contractItem: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'i1', dailyRate: 100, monthlyRate: 3000 },
          { id: 'i2', dailyRate: 150, monthlyRate: 4500 },
        ]),
      },
      contract: {
        findMany: jest.fn().mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]),
      },
      supplyOrder: {
        findMany: jest.fn().mockResolvedValue([{ supplyNumber: 'AF-001' }, { supplyNumber: 'AF-002' }]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('reajusteIgpmPreview', () => {
    it('retorna itemCount, contractCount, valorAtualMensal, valorAposReajuste, impactoMensal', async () => {
      const result = await service.reajusteIgpmPreview('company-1', { percentual: 5 });

      expect(result).toHaveProperty('itemCount', 2);
      expect(result).toHaveProperty('contractCount', 2);
      expect(result).toHaveProperty('percentual', 5);
      expect(result).toHaveProperty('valorAtualMensal');
      expect(result).toHaveProperty('valorAposReajuste');
      expect(result).toHaveProperty('impactoMensal');
      expect(result.valorAtualMensal).toBe(7500);
      expect(result.valorAposReajuste).toBe(7875);
      expect(result.impactoMensal).toBe(375);
    });

    it('com contractIds filtra contratos', async () => {
      await service.reajusteIgpmPreview('company-1', {
        percentual: 10,
        contractIds: ['c1', 'c2'],
      });

      expect(prisma.contractItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            contract: expect.objectContaining({ id: { in: ['c1', 'c2'] } }),
          }),
        }),
      );
    });
  });

  describe('nextSupplyOrderNumber', () => {
    it('retorna AF-003 quando existem AF-001 e AF-002', async () => {
      const result = await service.nextSupplyOrderNumber('contract-1');

      expect(result).toBe('AF-003');
    });

    it('retorna AF-001 quando não há supply orders', async () => {
      (prisma.supplyOrder.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.nextSupplyOrderNumber('contract-1');

      expect(result).toBe('AF-001');
    });
  });
});
