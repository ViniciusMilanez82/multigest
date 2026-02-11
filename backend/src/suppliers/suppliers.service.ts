import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: any) {
    return this.prisma.supplier.create({ data: { companyId, ...dto } });
  }

  async list(companyId: string, query: any) {
    const { search } = query;
    const where: any = { companyId, deletedAt: null, isActive: true };
    if (search) {
      where.OR = [
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { nomeFantasia: { contains: search, mode: 'insensitive' } },
        { cpfCnpj: { contains: search } },
      ];
    }
    return this.prisma.supplier.findMany({
      where,
      orderBy: { razaoSocial: 'asc' },
      include: { addresses: true, contacts: true },
    });
  }

  async get(companyId: string, id: string) {
    const s = await this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { addresses: true, contacts: true },
    });
    if (!s) throw new NotFoundException('Fornecedor não encontrado');
    return s;
  }

  async update(companyId: string, id: string, dto: any) {
    await this.get(companyId, id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.get(companyId, id);
    return this.prisma.supplier.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }
}
