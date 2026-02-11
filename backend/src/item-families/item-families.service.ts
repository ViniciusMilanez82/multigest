import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { CreateSubfamilyDto } from './dto/create-subfamily.dto';
import { UpdateSubfamilyDto } from './dto/update-subfamily.dto';

@Injectable()
export class ItemFamiliesService {
  constructor(private prisma: PrismaService) {}

  async createFamily(companyId: string, dto: CreateFamilyDto) {
    const existing = await this.prisma.itemFamily.findUnique({
      where: {
        companyId_name: { companyId, name: dto.name.trim() },
      },
    });
    if (existing) throw new ConflictException('Família já cadastrada');
    return this.prisma.itemFamily.create({
      data: {
        companyId,
        name: dto.name.trim(),
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listFamilies(companyId: string, includeInactive = false) {
    const where: any = { companyId };
    if (!includeInactive) where.isActive = true;
    return this.prisma.itemFamily.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        subfamilies: {
          where: includeInactive ? undefined : { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: { assetType: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async getFamily(companyId: string, id: string) {
    const f = await this.prisma.itemFamily.findFirst({
      where: { id, companyId },
      include: {
        subfamilies: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: { assetType: { select: { id: true, name: true } } },
        },
      },
    });
    if (!f) throw new NotFoundException('Família não encontrada');
    return f;
  }

  async updateFamily(companyId: string, id: string, dto: UpdateFamilyDto) {
    await this.getFamily(companyId, id);
    if (dto.name !== undefined) {
      const existing = await this.prisma.itemFamily.findFirst({
        where: {
          companyId,
          name: dto.name.trim(),
          id: { not: id },
        },
      });
      if (existing) throw new ConflictException('Família com esse nome já existe');
    }
    return this.prisma.itemFamily.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async removeFamily(companyId: string, id: string) {
    await this.getFamily(companyId, id);
    const count = await this.prisma.itemSubfamily.count({ where: { familyId: id } });
    if (count > 0) {
      await this.prisma.itemFamily.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Família desativada (possui subfamílias)' };
    }
    await this.prisma.itemFamily.delete({ where: { id } });
    return { ok: true };
  }

  // --- Subfamilies ---

  async createSubfamily(
    companyId: string,
    familyId: string,
    dto: CreateSubfamilyDto,
  ) {
    const family = await this.getFamily(companyId, familyId);
    const existing = await this.prisma.itemSubfamily.findUnique({
      where: {
        familyId_name: { familyId, name: dto.name.trim() },
      },
    });
    if (existing) throw new ConflictException('Subfamília já cadastrada');
    return this.prisma.itemSubfamily.create({
      data: {
        familyId,
        name: dto.name.trim(),
        assetTypeId: dto.assetTypeId || null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: { assetType: { select: { id: true, name: true } } },
    });
  }

  async listSubfamilies(companyId: string, familyId?: string) {
    const where: any = {};
    if (familyId) {
      const fam = await this.prisma.itemFamily.findFirst({
        where: { id: familyId, companyId },
      });
      if (!fam) throw new NotFoundException('Família não encontrada');
      where.familyId = familyId;
    }
    return this.prisma.itemSubfamily.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        family: { select: { id: true, name: true } },
        assetType: { select: { id: true, name: true } },
      },
    });
  }

  async getSubfamily(companyId: string, id: string) {
    const s = await this.prisma.itemSubfamily.findFirst({
      where: { id, family: { companyId } },
      include: {
        family: true,
        assetType: { select: { id: true, name: true } },
      },
    });
    if (!s) throw new NotFoundException('Subfamília não encontrada');
    return s;
  }

  async updateSubfamily(
    companyId: string,
    id: string,
    dto: UpdateSubfamilyDto,
  ) {
    await this.getSubfamily(companyId, id);
    if (dto.name !== undefined) {
      const sub = await this.prisma.itemSubfamily.findUnique({
        where: { id },
        include: { family: true },
      });
      if (sub) {
        const existing = await this.prisma.itemSubfamily.findFirst({
          where: {
            familyId: sub.familyId,
            name: dto.name.trim(),
            id: { not: id },
          },
        });
        if (existing) throw new ConflictException('Subfamília com esse nome já existe');
      }
    }
    return this.prisma.itemSubfamily.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.assetTypeId !== undefined && { assetTypeId: dto.assetTypeId || null }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { assetType: { select: { id: true, name: true } } },
    });
  }

  async removeSubfamily(companyId: string, id: string) {
    await this.getSubfamily(companyId, id);
    await this.prisma.itemSubfamily.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }
}
