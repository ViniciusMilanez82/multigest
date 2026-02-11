import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { AddContractItemDto } from './dto/add-item.dto';
import { ChangeContractStatusDto } from './dto/change-status.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateContractDto) {
    const existing = await this.prisma.contract.findUnique({
      where: {
        companyId_contractNumber: {
          companyId,
          contractNumber: dto.contractNumber,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Número de contrato já cadastrado nesta empresa',
      );
    }

    // Verify customer belongs to company
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId, isActive: true },
    });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const { items, ...contractData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          ...contractData,
          companyId,
          startDate: new Date(dto.startDate),
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        },
        include: { customer: true, items: { include: { asset: true } } },
      });

      if (items && items.length > 0) {
        for (const item of items) {
          await tx.contractItem.create({
            data: {
              contractId: contract.id,
              assetId: item.assetId,
              dailyRate: item.dailyRate,
              monthlyRate: item.monthlyRate,
              startDate: new Date(item.startDate),
              endDate: item.endDate ? new Date(item.endDate) : null,
              departureDate: item.departureDate ? new Date(item.departureDate) : null,
              notes: item.notes,
            },
          });
        }

        return tx.contract.findUnique({
          where: { id: contract.id },
          include: {
            customer: true,
            items: { include: { asset: { include: { assetType: true } } } },
          },
        });
      }

      return contract;
    });
  }

  async findAll(companyId: string, query: QueryContractsDto) {
    const { search, status, customerId, page = 1, limit = 20 } = query;

    const where: any = {
      companyId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(search
        ? {
            OR: [
              {
                contractNumber: { contains: search, mode: 'insensitive' },
              },
              {
                customer: {
                  razaoSocial: { contains: search, mode: 'insensitive' },
                },
              },
              {
                customer: {
                  nomeFantasia: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          customer: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(companyId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: {
          include: { asset: { include: { assetType: true } } },
          orderBy: { createdAt: 'asc' },
        },
        addendums: { orderBy: { addendumNumber: 'asc' } },
        measurements: { orderBy: { periodStart: 'desc' }, take: 10 },
        movements: { orderBy: { movementDate: 'desc' }, take: 20 },
      },
    });
    if (!contract) throw new NotFoundException('Contrato não encontrado');
    return contract;
  }

  async update(companyId: string, id: string, dto: UpdateContractDto) {
    await this.findOne(companyId, id);

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.contract.update({
      where: { id },
      data,
      include: {
        customer: true,
        items: { include: { asset: { include: { assetType: true } } } },
      },
    });
  }

  async changeStatus(
    companyId: string,
    id: string,
    dto: ChangeContractStatusDto,
  ) {
    const contract = await this.findOne(companyId, id);

    if (contract.status === dto.status) {
      throw new BadRequestException(
        `Contrato já está com status ${dto.status}`,
      );
    }

    // When activating, mark all items' assets as RENTED
    if (dto.status === 'ACTIVE') {
      const assetIds = contract.items
        .filter((item) => item.isActive)
        .map((item) => item.assetId);

      if (assetIds.length > 0) {
        await this.prisma.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { status: 'RENTED' },
        });
      }
    }

    // When terminating/cancelling, mark assets as AVAILABLE
    if (['TERMINATED', 'CANCELLED'].includes(dto.status)) {
      const assetIds = contract.items
        .filter((item) => item.isActive)
        .map((item) => item.assetId);

      if (assetIds.length > 0) {
        await this.prisma.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    return this.prisma.contract.update({
      where: { id },
      data: { status: dto.status as any },
      include: {
        customer: true,
        items: { include: { asset: true } },
      },
    });
  }

  async addItem(companyId: string, contractId: string, dto: AddContractItemDto) {
    const contract = await this.findOne(companyId, contractId);

    // Verify asset belongs to same company
    const asset = await this.prisma.asset.findFirst({
      where: { id: dto.assetId, companyId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundException('Ativo não encontrado');
    }

    const item = await this.prisma.contractItem.create({
      data: {
        contractId,
        assetId: dto.assetId,
        dailyRate: dto.dailyRate,
        monthlyRate: dto.monthlyRate,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        departureDate: dto.departureDate ? new Date(dto.departureDate) : null,
        notes: dto.notes,
        scheduledDeliveryDate: dto.scheduledDeliveryDate ? new Date(dto.scheduledDeliveryDate) : null,
      },
      include: { asset: { include: { assetType: true } } },
    });

    // If contract is active, mark asset as RENTED
    if (contract.status === 'ACTIVE') {
      await this.prisma.asset.update({
        where: { id: dto.assetId },
        data: { status: 'RENTED' },
      });
    }

    return item;
  }

  async removeItem(companyId: string, contractId: string, itemId: string) {
    await this.findOne(companyId, contractId);

    const item = await this.prisma.contractItem.findFirst({
      where: { id: itemId, contractId },
    });
    if (!item) {
      throw new NotFoundException('Item não encontrado no contrato');
    }

    await this.prisma.contractItem.update({
      where: { id: itemId },
      data: { isActive: false, endDate: new Date() },
    });

    // Release the asset
    await this.prisma.asset.update({
      where: { id: item.assetId },
      data: { status: 'AVAILABLE' },
    });

    return { message: 'Item removido do contrato' };
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.contract.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });
  }

  // ─── MEDIÇÕES ───

  async createMeasurement(companyId: string, contractId: string, dto: any) {
    await this.findOne(companyId, contractId);
    const items = dto.items || [];
    let totalValue = 0;

    return this.prisma.$transaction(async (tx) => {
      const measurement = await tx.measurement.create({
        data: {
          contractId,
          periodStart: new Date(dto.periodStart),
          periodEnd: new Date(dto.periodEnd),
          totalValue: 0,
          status: dto.status || 'DRAFT',
          notes: dto.notes,
        },
      });

      for (const item of items) {
        const billedDays = (item.days || 0) - (item.excludedDays || 0);
        const itemTotal = billedDays * Number(item.dailyRate);
        totalValue += itemTotal;
        await tx.measurementItem.create({
          data: {
            measurementId: measurement.id,
            contractItemId: item.contractItemId,
            days: item.days,
            excludedDays: item.excludedDays || 0,
            excludedReason: item.excludedReason,
            billedDays,
            dailyRate: item.dailyRate,
            totalValue: itemTotal,
          },
        });
      }

      return tx.measurement.update({
        where: { id: measurement.id },
        data: { totalValue },
        include: { items: true },
      });
    });
  }

  async listMeasurements(contractId: string) {
    return this.prisma.measurement.findMany({
      where: { contractId },
      include: { items: { include: { contractItem: { include: { asset: true } } } }, invoice: { select: { id: true, invoiceNumber: true } } },
      orderBy: { periodStart: 'desc' },
    });
  }

  async approveMeasurement(id: string) {
    return this.prisma.measurement.update({ where: { id }, data: { status: 'APPROVED' } });
  }

  // ─── MOVIMENTAÇÕES ───

  async createMovement(contractId: string, dto: any) {
    return this.prisma.contractMovement.create({
      data: {
        contractId,
        type: dto.type,
        assetCode: dto.assetCode,
        movementDate: new Date(dto.movementDate),
        address: dto.address,
        notes: dto.notes,
      },
    });
  }

  async listMovements(contractId: string) {
    return this.prisma.contractMovement.findMany({
      where: { contractId },
      orderBy: { movementDate: 'desc' },
    });
  }

  // ─── ADITIVOS ───

  async createAddendum(contractId: string, dto: any) {
    const count = await this.prisma.contractAddendum.count({ where: { contractId } });
    return this.prisma.contractAddendum.create({
      data: {
        contractId,
        addendumNumber: count + 1,
        type: dto.type,
        description: dto.description,
        effectiveDate: new Date(dto.effectiveDate),
        notes: dto.notes,
      },
    });
  }

  async listAddendums(contractId: string) {
    return this.prisma.contractAddendum.findMany({
      where: { contractId },
      orderBy: { addendumNumber: 'asc' },
    });
  }

  // ─── TRAVA EXPEDIÇÃO ───

  async updateItemDelivery(companyId: string, contractId: string, itemId: string, dto: { scheduledDeliveryDate?: string; deliveryBlockedReason?: string | null }) {
    await this.findOne(companyId, contractId);
    const item = await this.prisma.contractItem.findFirst({ where: { id: itemId, contractId } });
    if (!item) throw new NotFoundException('Item não encontrado');
    const data: any = {};
    if (dto.scheduledDeliveryDate !== undefined) data.scheduledDeliveryDate = dto.scheduledDeliveryDate ? new Date(dto.scheduledDeliveryDate) : null;
    if (dto.deliveryBlockedReason !== undefined) data.deliveryBlockedReason = dto.deliveryBlockedReason || null;
    return this.prisma.contractItem.update({
      where: { id: itemId },
      data,
      include: { asset: { include: { assetType: true } } },
    });
  }

  async markContractSigned(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.contract.update({
      where: { id },
      data: { contractSignedAt: new Date() },
      include: { customer: true, items: { include: { asset: true } } },
    });
  }

  // ─── REAJUSTE IGPM ───

  async reajusteIgpm(companyId: string, dto: { percentual: number; contractIds?: string[] }) {
    const where: any = { companyId, deletedAt: null, status: 'ACTIVE' };
    if (dto.contractIds?.length) where.id = { in: dto.contractIds };
    const items = await this.prisma.contractItem.findMany({
      where: { contract: where, isActive: true },
      select: { id: true, dailyRate: true, monthlyRate: true },
    });
    const factor = 1 + dto.percentual / 100;
    for (const it of items) {
      await this.prisma.contractItem.update({
        where: { id: it.id },
        data: {
          dailyRate: Number(it.dailyRate) * factor,
          monthlyRate: it.monthlyRate ? Number(it.monthlyRate) * factor : undefined,
        },
      });
    }
    return { updated: items.length, percentual: dto.percentual };
  }

  // ─── TROCA DE TITULARIDADE ───

  async trocaTitularidade(companyId: string, contractId: string, newCustomerId: string) {
    const contract = await this.findOne(companyId, contractId);
    const newCustomer = await this.prisma.customer.findFirst({
      where: { id: newCustomerId, companyId, isActive: true },
    });
    if (!newCustomer) throw new NotFoundException('Novo cliente não encontrado');

    const contractNumber = await this.nextContractNumber(companyId);
    return this.prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: contractId },
        data: { status: 'TERMINATED', endDate: new Date() },
      });
      const items = await tx.contractItem.findMany({
        where: { contractId, isActive: true },
        include: { asset: true },
      });
      const novo = await tx.contract.create({
        data: {
          companyId,
          customerId: newCustomerId,
          contractNumber,
          type: contract.type,
          status: 'ACTIVE',
          startDate: new Date(),
          paymentTerms: contract.paymentTerms,
          paymentMethod: contract.paymentMethod,
          notes: `Troca de titularidade do contrato ${contract.contractNumber}`,
        },
      });
      for (const it of items) {
        await tx.contractItem.create({
          data: {
            contractId: novo.id,
            assetId: it.assetId,
            dailyRate: it.dailyRate,
            monthlyRate: it.monthlyRate,
            startDate: new Date(),
            notes: it.notes,
          },
        });
      }
      return tx.contract.findUnique({
        where: { id: novo.id },
        include: { customer: true, items: { include: { asset: true } } },
      });
    });
  }

  // ─── ANÁLISE CRÍTICA ───

  async createAnalysis(companyId: string, contractId: string, dto: any) {
    await this.findOne(companyId, contractId);
    return this.prisma.contractAnalysis.create({
      data: {
        contractId,
        proposalNumber: dto.proposalNumber,
        proposalDate: dto.proposalDate ? new Date(dto.proposalDate) : null,
        customerName: dto.customerName,
        cnpj: dto.cnpj,
        addressCnpj: dto.addressCnpj,
        addressInstall: dto.addressInstall,
        contactComercial: dto.contactComercial,
        contactFinanceiro: dto.contactFinanceiro,
        contactRecebimento: dto.contactRecebimento,
        responsible: dto.responsible,
        witness: dto.witness,
        equipmentModels: dto.equipmentModels,
        monthlyValue: dto.monthlyValue,
        monthsRental: dto.monthsRental,
        expectedExit: dto.expectedExit ? new Date(dto.expectedExit) : null,
        extraData: dto.extraData,
      },
    });
  }

  async listAnalyses(contractId: string) {
    return this.prisma.contractAnalysis.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAnalysis(companyId: string, contractId: string, analysisId: string, dto: any) {
    await this.findOne(companyId, contractId);
    const a = await this.prisma.contractAnalysis.findFirst({ where: { id: analysisId, contractId } });
    if (!a) throw new NotFoundException('Análise não encontrada');
    const data: any = { ...dto };
    if (dto.proposalDate) data.proposalDate = new Date(dto.proposalDate);
    if (dto.expectedExit) data.expectedExit = new Date(dto.expectedExit);
    return this.prisma.contractAnalysis.update({ where: { id: analysisId }, data });
  }

  // ─── DOCUMENTO AF (SupplyOrder) ───

  async createSupplyOrder(companyId: string, contractId: string, dto: any) {
    await this.findOne(companyId, contractId);
    return this.prisma.supplyOrder.create({
      data: {
        contractId,
        supplyNumber: dto.supplyNumber,
        customerName: dto.customerName,
        mobilization: dto.mobilization ?? false,
        equipmentCount: dto.equipmentCount,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        layoutNotes: dto.layoutNotes,
        technicalNotes: dto.technicalNotes,
      },
    });
  }

  async listSupplyOrders(contractId: string) {
    return this.prisma.supplyOrder.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async nextContractNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.prisma.contract.findFirst({
      where: { companyId, contractNumber: { contains: String(year) } },
      orderBy: { createdAt: 'desc' },
    });
    const match = last?.contractNumber?.match(/-(\d+)$/);
    const seq = match ? parseInt(match[1], 10) + 1 : 1;
    return `CTR-${year}-${String(seq).padStart(3, '0')}`;
  }
}
