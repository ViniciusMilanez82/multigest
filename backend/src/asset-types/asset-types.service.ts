import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';

@Injectable()
export class AssetTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssetTypeDto) {
    const existing = await this.prisma.assetType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Tipo de ativo já cadastrado');
    }
    return this.prisma.assetType.create({ data: dto });
  }

  async findAll() {
    return this.prisma.assetType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const assetType = await this.prisma.assetType.findUnique({
      where: { id },
    });
    if (!assetType) throw new NotFoundException('Tipo de ativo não encontrado');
    return assetType;
  }

  async update(id: string, dto: UpdateAssetTypeDto) {
    await this.findOne(id);
    return this.prisma.assetType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.assetType.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
