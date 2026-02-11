import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateAssetDto) {
    const existing = await this.prisma.asset.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException('Código de ativo já cadastrado nesta empresa');
    }

    const initialStatus = dto.status || 'AVAILABLE';

    const asset = await this.prisma.asset.create({
      data: {
        ...dto,
        companyId,
        status: initialStatus,
      },
      include: { assetType: true },
    });

    await this.prisma.assetStatusHistory.create({
      data: {
        assetId: asset.id,
        fromStatus: null,
        toStatus: initialStatus,
        reason: 'Cadastro inicial do ativo',
      },
    });

    return asset;
  }

  async findAll(companyId: string, query: QueryAssetsDto) {
    const { search, status, condition, assetTypeId, page = 1, limit = 20 } = query;

    const where: any = {
      companyId,
      isActive: true,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(condition ? { condition } : {}),
      ...(assetTypeId ? { assetTypeId } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { serialNumber: { contains: search, mode: 'insensitive' } },
              { manufacturer: { contains: search, mode: 'insensitive' } },
              { currentLocation: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: { assetType: true },
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, companyId },
      include: {
        assetType: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
        maintenances: { orderBy: { startDate: 'desc' }, take: 10 },
      },
    });
    if (!asset) throw new NotFoundException('Ativo não encontrado');
    return asset;
  }

  async update(companyId: string, id: string, dto: UpdateAssetDto) {
    await this.findOne(companyId, id);
    return this.prisma.asset.update({
      where: { id },
      data: dto,
      include: { assetType: true },
    });
  }

  async changeStatus(companyId: string, id: string, dto: ChangeStatusDto) {
    const asset = await this.findOne(companyId, id);

    if (asset.status === dto.newStatus) {
      throw new BadRequestException(
        `Ativo já está com status ${dto.newStatus}`,
      );
    }

    const [updatedAsset] = await this.prisma.$transaction([
      this.prisma.asset.update({
        where: { id },
        data: { status: dto.newStatus },
        include: { assetType: true },
      }),
      this.prisma.assetStatusHistory.create({
        data: {
          assetId: id,
          fromStatus: asset.status,
          toStatus: dto.newStatus,
          reason: dto.reason,
          changedBy: dto.changedBy,
        },
      }),
    ]);

    return updatedAsset;
  }

  async decommission(companyId: string, id: string, dto?: ChangeStatusDto) {
    const asset = await this.findOne(companyId, id);

    const [updatedAsset] = await this.prisma.$transaction([
      this.prisma.asset.update({
        where: { id },
        data: {
          status: 'DECOMMISSIONED',
          isActive: false,
          deletedAt: new Date(),
        },
        include: { assetType: true },
      }),
      this.prisma.assetStatusHistory.create({
        data: {
          assetId: id,
          fromStatus: asset.status,
          toStatus: 'DECOMMISSIONED',
          reason: dto?.reason || 'Ativo descomissionado',
          changedBy: dto?.changedBy,
        },
      }),
    ]);

    return updatedAsset;
  }

  async getInventorySummary(companyId: string) {
    const [byStatus, byType, total] = await Promise.all([
      this.prisma.asset.groupBy({
        by: ['status'],
        where: { companyId, isActive: true, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.asset.groupBy({
        by: ['assetTypeId'],
        where: { companyId, isActive: true, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.asset.count({
        where: { companyId, isActive: true, deletedAt: null },
      }),
    ]);

    const rentedCount =
      byStatus.find((s) => s.status === 'RENTED')?._count?.id || 0;
    const occupancyRate = total > 0 ? (rentedCount / total) * 100 : 0;

    // Fetch asset type names for the byType summary
    const assetTypeIds = byType.map((t) => t.assetTypeId);
    const assetTypes = await this.prisma.assetType.findMany({
      where: { id: { in: assetTypeIds } },
      select: { id: true, name: true },
    });
    const typeMap = new Map(assetTypes.map((t) => [t.id, t.name]));

    return {
      total,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byType: byType.map((t) => ({
        assetTypeId: t.assetTypeId,
        assetTypeName: typeMap.get(t.assetTypeId) || 'Desconhecido',
        count: t._count.id,
      })),
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }

  // ─── MANUTENÇÕES ───

  async addMaintenance(companyId: string, assetId: string, dto: any) {
    await this.findOne(companyId, assetId);
    return this.prisma.assetMaintenance.create({
      data: {
        assetId,
        supplierId: dto.supplierId,
        type: dto.type || 'CORRECTIVE',
        description: dto.description,
        cost: dto.cost,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        notes: dto.notes,
      },
    });
  }

  async listMaintenances(assetId: string) {
    return this.prisma.assetMaintenance.findMany({
      where: { assetId },
      orderBy: { startDate: 'desc' },
      include: { supplier: { select: { razaoSocial: true } } },
    });
  }
}
