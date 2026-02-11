import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ConvertToContractDto } from './dto/convert-to-contract.dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  private async nextProposalNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.prisma.proposal.findFirst({
      where: { companyId, proposalNumber: { startsWith: String(year) } },
      orderBy: { proposalNumber: 'desc' },
    });
    const seq = last ? parseInt(last.proposalNumber.split('-')[1] || '0', 10) + 1 : 1;
    return `${year}-${String(seq).padStart(4, '0')}`;
  }

  private calcValorTotal(items: { quantidade: number; valorUnitario: number; frete?: number }[]): number {
    return items.reduce((acc, i) => {
      const subtotal = i.quantidade * i.valorUnitario;
      const frete = (i.frete ?? 0) / (i.quantidade || 1);
      return acc + subtotal + (frete * i.quantidade);
    }, 0);
  }

  async create(companyId: string, dto: CreateProposalDto) {
    const valorTotal = this.calcValorTotal(dto.items);
    const proposalNumber = await this.nextProposalNumber(companyId);

    if (dto.customerId) {
      const cust = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, companyId, isActive: true },
      });
      if (!cust) throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.proposal.create({
      data: {
        companyId,
        customerId: dto.customerId,
        proposalNumber,
        type: dto.type as any,
        status: 'RASCUNHO',
        items: dto.items as any,
        valorTotal,
        companyName: dto.companyName,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
      },
      include: { customer: true },
    });
  }

  async list(companyId: string, query: { status?: string; type?: string; search?: string }) {
    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { proposalNumber: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { contactName: { contains: query.search, mode: 'insensitive' } },
        { customer: { razaoSocial: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.proposal.findMany({
      where,
      include: { customer: { select: { id: true, razaoSocial: true, nomeFantasia: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(companyId: string, id: string) {
    const p = await this.prisma.proposal.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        contract: { select: { id: true, contractNumber: true } },
      },
    });
    if (!p) throw new NotFoundException('Proposta não encontrada');
    return p;
  }

  async update(companyId: string, id: string, dto: UpdateProposalDto) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'RASCUNHO') {
      throw new BadRequestException('Apenas propostas em rascunho podem ser editadas');
    }

    const items = dto.items ?? (prop.items as any[]);
    const valorTotal = this.calcValorTotal(items);

    return this.prisma.proposal.update({
      where: { id },
      data: {
        ...(dto as any),
        items: dto.items ?? undefined,
        valorTotal,
      },
      include: { customer: true },
    });
  }

  async delete(companyId: string, id: string) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'RASCUNHO') {
      throw new BadRequestException('Apenas propostas em rascunho podem ser excluídas');
    }
    await this.prisma.proposal.delete({ where: { id } });
    return { ok: true };
  }

  async accept(companyId: string, id: string) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'ENVIADA') {
      throw new BadRequestException('Apenas propostas com status ENVIADA podem ser aceitas');
    }
    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'ACEITA' },
      include: { customer: true },
    });
  }

  async refuse(companyId: string, id: string) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'ENVIADA') {
      throw new BadRequestException('Apenas propostas com status ENVIADA podem ser recusadas');
    }
    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'RECUSADA' },
      include: { customer: true },
    });
  }

  async send(companyId: string, id: string) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'RASCUNHO') {
      throw new BadRequestException('Apenas propostas em rascunho podem ser enviadas');
    }
    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'ENVIADA' },
      include: { customer: true },
    });
  }

  async convertToContract(companyId: string, id: string, dto: ConvertToContractDto) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'ACEITA') {
      throw new BadRequestException('Apenas propostas aceitas podem ser convertidas em contrato');
    }
    if (prop.type === 'VENDA') {
      throw new BadRequestException('Proposta de venda deve ser convertida em fatura');
    }
    if (prop.contractId) {
      return this.prisma.contract.findUnique({
        where: { id: prop.contractId },
        include: { customer: true, items: true },
      });
    }

    let customerId = prop.customerId;
    if (!customerId) {
      const cust = await this.prisma.customer.findFirst({
        where: { companyId, razaoSocial: prop.companyName ?? '' },
      });
      if (!cust) {
        const novo = await this.prisma.customer.create({
          data: {
            companyId,
            cpfCnpj: `TEMP-${Date.now()}`,
            razaoSocial: prop.companyName ?? 'Cliente da proposta',
            nomeFantasia: prop.contactName,
            notes: `Criado a partir da proposta ${prop.proposalNumber}`,
          },
        });
        customerId = novo.id;
      } else {
        customerId = cust.id;
      }
    }

    const contractNumber = await this.nextContractNumber(companyId);
    const contract = await this.prisma.contract.create({
      data: {
        companyId,
        customerId,
        contractNumber,
        type: 'MEDICAO',
        status: 'DRAFT',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        paymentTerms: dto.paymentTerms,
        paymentMethod: dto.paymentMethod,
      },
    });

    await this.prisma.proposal.update({
      where: { id },
      data: { status: 'CONVERTIDA', contractId: contract.id },
    });

    return this.prisma.contract.findUnique({
      where: { id: contract.id },
      include: { customer: true, items: true },
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

  async convertToInvoice(companyId: string, id: string) {
    const prop = await this.get(companyId, id);
    if (prop.status !== 'ACEITA') {
      throw new BadRequestException('Apenas propostas aceitas podem ser convertidas em fatura');
    }
    if (prop.type !== 'VENDA') {
      throw new BadRequestException('Proposta de locação/evento deve ser convertida em contrato');
    }
    if (prop.invoiceId) {
      return this.prisma.invoice.findUnique({
        where: { id: prop.invoiceId },
        include: { customer: true },
      });
    }

    let customerId = prop.customerId;
    if (!customerId) {
      const novo = await this.prisma.customer.create({
        data: {
          companyId,
          cpfCnpj: `TEMP-${Date.now()}`,
          razaoSocial: prop.companyName ?? 'Cliente da proposta',
          nomeFantasia: prop.contactName,
          notes: `Criado a partir da proposta ${prop.proposalNumber}`,
        },
      });
      customerId = novo.id;
    }

    const invoiceNumber = await this.nextInvoiceNumber(companyId);
    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        customerId,
        invoiceNumber,
        status: 'OPEN',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: prop.valorTotal,
        notes: `Proposta ${prop.proposalNumber}`,
      },
    });

    await this.prisma.proposal.update({
      where: { id },
      data: { status: 'CONVERTIDA', invoiceId: invoice.id },
    });

    return this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { customer: true },
    });
  }

  private async nextInvoiceNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.prisma.invoice.findFirst({
      where: { companyId, invoiceNumber: { contains: String(year) } },
      orderBy: { createdAt: 'desc' },
    });
    const match = last?.invoiceNumber?.match(/-(\d+)$/);
    const seq = match ? parseInt(match[1], 10) + 1 : 1;
    return `NF-${year}-${String(seq).padStart(4, '0')}`;
  }
}
