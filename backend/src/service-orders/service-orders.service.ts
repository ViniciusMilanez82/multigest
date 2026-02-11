import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceOrdersService {
  constructor(private prisma: PrismaService) {}

  private async nextOrderNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.prisma.serviceOrder.findFirst({
      where: { companyId, orderNumber: { contains: String(year) } },
      orderBy: { createdAt: 'desc' },
    });
    const match = last?.orderNumber?.match(/-(\d+)$/);
    const seq = match ? parseInt(match[1], 10) + 1 : 1;
    return `OS-${year}-${String(seq).padStart(4, '0')}`;
  }

  async create(companyId: string, dto: any) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: dto.contractId, companyId },
    });
    if (!contract) throw new NotFoundException('Contrato não encontrado');
    const orderNumber = await this.nextOrderNumber(companyId);
    return this.prisma.serviceOrder.create({
      data: {
        companyId,
        contractId: dto.contractId,
        orderNumber,
        type: dto.type as any,
        address: dto.address,
        addressTo: dto.addressTo,
        phone: dto.phone,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        freightValue: dto.freightValue,
        extraTax: dto.extraTax,
        notes: dto.notes,
        emitNf: dto.emitNf ?? true,
      },
      include: { contract: { include: { customer: true } } },
    });
  }

  async list(companyId: string, query: { contractId?: string; type?: string; status?: string }) {
    const where: any = { companyId };
    if (query.contractId) where.contractId = query.contractId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    return this.prisma.serviceOrder.findMany({
      where,
      include: { contract: { include: { customer: { select: { id: true, razaoSocial: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(companyId: string, id: string) {
    const o = await this.prisma.serviceOrder.findFirst({
      where: { id, companyId },
      include: { contract: { include: { customer: true } } },
    });
    if (!o) throw new NotFoundException('Ordem de serviço não encontrada');
    return o;
  }

  async update(companyId: string, id: string, dto: any) {
    await this.get(companyId, id);
    const data: any = { ...dto };
    if (dto.scheduledDate) data.scheduledDate = new Date(dto.scheduledDate);
    if (dto.status) data.status = dto.status;
    return this.prisma.serviceOrder.update({
      where: { id },
      data,
      include: { contract: { include: { customer: true } } },
    });
  }
}
