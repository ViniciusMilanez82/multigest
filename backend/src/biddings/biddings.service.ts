import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BiddingsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: any) {
    return this.prisma.bidding.create({
      data: { companyId, biddingNumber: dto.biddingNumber, title: dto.title, description: dto.description, openingDate: new Date(dto.openingDate), closingDate: dto.closingDate ? new Date(dto.closingDate) : null, estimatedValue: dto.estimatedValue, status: dto.status || 'OPEN', requiredDocs: dto.requiredDocs, notes: dto.notes },
    });
  }

  async list(companyId: string, query: any) {
    const { search, status } = query;
    const where: any = { companyId };
    if (status) where.status = status;
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { biddingNumber: { contains: search, mode: 'insensitive' } }];
    return this.prisma.bidding.findMany({ where, orderBy: { openingDate: 'desc' } });
  }

  async get(companyId: string, id: string) {
    const b = await this.prisma.bidding.findFirst({ where: { id, companyId } });
    if (!b) throw new NotFoundException('Licitação não encontrada');
    return b;
  }

  async update(companyId: string, id: string, dto: any) {
    await this.get(companyId, id);
    const data: any = { ...dto };
    if (dto.openingDate) data.openingDate = new Date(dto.openingDate);
    if (dto.closingDate) data.closingDate = new Date(dto.closingDate);
    return this.prisma.bidding.update({ where: { id }, data });
  }

  async changeStatus(companyId: string, id: string, status: string) {
    await this.get(companyId, id);
    return this.prisma.bidding.update({ where: { id }, data: { status: status as any } });
  }
}
