import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';

@Injectable()
export class StockLocationsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateStockLocationDto) {
    return this.prisma.stockLocation.create({
      data: { companyId, ...dto },
      include: { customer: { select: { id: true, razaoSocial: true, nomeFantasia: true } } },
    });
  }

  async list(companyId: string, query: any) {
    const { search, includeCustomers } = query;
    const where: any = { companyId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.stockLocation.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } },
        _count: { select: { assetsHere: true } },
      },
    });
  }

  async get(companyId: string, id: string) {
    const loc = await this.prisma.stockLocation.findFirst({
      where: { id, companyId },
      include: {
        customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } },
        assetsHere: {
          where: { deletedAt: null },
          select: { id: true, code: true, status: true, assetType: { select: { name: true } } },
        },
      },
    });
    if (!loc) throw new NotFoundException('Local de estoque não encontrado');
    return loc;
  }

  async update(companyId: string, id: string, dto: UpdateStockLocationDto) {
    await this.get(companyId, id);
    return this.prisma.stockLocation.update({
      where: { id },
      data: dto,
      include: { customer: { select: { id: true, razaoSocial: true, nomeFantasia: true } } },
    });
  }

  async remove(companyId: string, id: string) {
    await this.get(companyId, id);
    return this.prisma.stockLocation.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Mover um ativo para um local de estoque (registra histórico)
  async moveAsset(companyId: string, assetId: string, toLocationId: string, movementType: string, notes?: string, userId?: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, companyId, deletedAt: null } });
    if (!asset) throw new NotFoundException('Ativo não encontrado');

    const toLocation = await this.prisma.stockLocation.findFirst({ where: { id: toLocationId, companyId } });
    if (!toLocation) throw new NotFoundException('Local de destino não encontrado');

    // Registrar histórico de movimentação
    await this.prisma.assetLocationHistory.create({
      data: {
        assetId,
        fromLocationId: asset.currentLocationId,
        toLocationId,
        movementDate: new Date(),
        movementType: movementType as any,
        notes,
        createdBy: userId,
      },
    });

    // Atualizar localização atual do ativo
    await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        currentLocationId: toLocationId,
        currentLocation: toLocation.name,
      },
    });

    return { message: 'Ativo movido com sucesso', toLocation: toLocation.name };
  }

  // Histórico de movimentação de um ativo
  async getAssetLocationHistory(assetId: string) {
    return this.prisma.assetLocationHistory.findMany({
      where: { assetId },
      orderBy: { movementDate: 'desc' },
      include: {
        fromLocation: { select: { id: true, name: true, customer: { select: { razaoSocial: true } } } },
        toLocation: { select: { id: true, name: true, customer: { select: { razaoSocial: true } } } },
      },
    });
  }
}
