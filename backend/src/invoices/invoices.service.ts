import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        companyId,
        customerId: dto.customerId,
        contractId: dto.contractId,
        invoiceNumber: dto.invoiceNumber,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        billingPeriodStart: dto.billingPeriodStart ? new Date(dto.billingPeriodStart) : null,
        billingPeriodEnd: dto.billingPeriodEnd ? new Date(dto.billingPeriodEnd) : null,
        amount: dto.amount,
        notes: dto.notes,
      },
    });
  }

  async getNextInvoiceNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const pattern = `${year}%`;
    const last = await this.prisma.invoice.findFirst({
      where: { companyId, invoiceNumber: { startsWith: String(year) } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });
    let seq = 1;
    if (last?.invoiceNumber) {
      const match = last.invoiceNumber.match(/\d+$/);
      if (match) seq = parseInt(match[0], 10) + 1;
    }
    return `${year}-${String(seq).padStart(4, '0')}`;
  }

  async checkBillingOverlap(contractId: string, periodStart: Date, periodEnd: Date): Promise<boolean> {
    const overlapping = await this.prisma.invoice.findFirst({
      where: {
        contractId,
        billingPeriodStart: { lte: periodEnd },
        billingPeriodEnd: { gte: periodStart },
      },
    });
    return !!overlapping;
  }

  // Faturar containers de um contrato com período e exclusão de dias
  async createFromContract(companyId: string, dto: {
    contractId: string;
    invoiceNumber?: string;
    issueDate?: string;
    dueDate: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    notes?: string;
    items: {
      contractItemId: string;
      excludedDays?: number;
      excludedReason?: string;
    }[];
  }) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: dto.contractId, companyId, deletedAt: null },
      include: {
        customer: true,
        items: { where: { isActive: true }, include: { asset: true } },
      },
    });
    if (!contract) throw new NotFoundException('Contrato não encontrado');

    const periodStart = new Date(dto.billingPeriodStart);
    const periodEnd = new Date(dto.billingPeriodEnd);

    const hasOverlap = await this.checkBillingOverlap(dto.contractId, periodStart, periodEnd);
    if (hasOverlap) {
      throw new BadRequestException(
        'Já existe fatura para este contrato com período sobreposto. Verifique as datas.',
      );
    }

    const invoiceNumber = dto.invoiceNumber?.trim() || (await this.getNextInvoiceNumber(companyId));
    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();
    const totalDaysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

    let totalAmount = 0;
    const invoiceItems: any[] = [];

    for (const dtoItem of dto.items) {
      const contractItem = contract.items.find(i => i.id === dtoItem.contractItemId);
      if (!contractItem) throw new NotFoundException(`Item de contrato ${dtoItem.contractItemId} não encontrado`);

      // Calcula a data efetiva de início da cobrança
      // Se tem departureDate, a cobrança só começa a partir dela
      const billingStart = contractItem.departureDate && contractItem.departureDate > periodStart
        ? contractItem.departureDate
        : periodStart;

      // Se o item tem endDate ou returnDate dentro do período
      const billingEnd = contractItem.returnDate && contractItem.returnDate < periodEnd
        ? contractItem.returnDate
        : (contractItem.endDate && contractItem.endDate < periodEnd ? contractItem.endDate : periodEnd);

      const actualDays = Math.max(0, Math.ceil((billingEnd.getTime() - billingStart.getTime()) / (1000 * 60 * 60 * 24)));
      const excludedDays = dtoItem.excludedDays || 0;
      const billedDays = Math.max(0, actualDays - excludedDays);
      const dailyRate = Number(contractItem.dailyRate);
      const itemTotal = billedDays * dailyRate;

      totalAmount += itemTotal;
      invoiceItems.push({
        contractItemId: contractItem.id,
        assetCode: contractItem.asset.code,
        periodStart: billingStart,
        periodEnd: billingEnd,
        totalDays: actualDays,
        excludedDays,
        excludedReason: dtoItem.excludedReason || null,
        billedDays,
        dailyRate,
        totalValue: itemTotal,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          companyId,
          customerId: contract.customerId,
          contractId: contract.id,
          invoiceNumber,
          issueDate,
          dueDate: new Date(dto.dueDate),
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          amount: totalAmount,
          notes: dto.notes,
        },
      });

      for (const item of invoiceItems) {
        await tx.invoiceItem.create({
          data: { invoiceId: invoice.id, ...item },
        });
      }

      return tx.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          items: true,
          customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } },
          contract: { select: { id: true, contractNumber: true } },
        },
      });
    });
  }

  async list(companyId: string, query: any) {
    const { search, status, contractId, page = 1, limit = 20 } = query;
    const where: any = { companyId };
    if (status) where.status = status;
    if (contractId) where.contractId = contractId;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { razaoSocial: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const orderBy = contractId ? { billingPeriodEnd: 'desc' as const } : { issueDate: 'desc' as const };
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy,
        include: { customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } }, contract: { select: { id: true, contractNumber: true } } },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async get(companyId: string, id: string) {
    const inv = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } },
        contract: { select: { id: true, contractNumber: true, type: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
        items: { orderBy: { assetCode: 'asc' } },
        collectionActions: { orderBy: { actionDate: 'desc' } },
      },
    });
    if (!inv) throw new NotFoundException('Fatura não encontrada');
    return inv;
  }

  async update(companyId: string, id: string, dto: UpdateInvoiceDto) {
    await this.get(companyId, id);
    const data: any = { ...dto };
    if (dto.issueDate) data.issueDate = new Date(dto.issueDate);
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    return this.prisma.invoice.update({ where: { id }, data });
  }

  async addPayment(companyId: string, invoiceId: string, dto: AddPaymentDto) {
    const invoice = await this.get(companyId, invoiceId);
    const currentPaid = Number(invoice.paidAmount);
    const totalAmount = Number(invoice.amount);
    const newPaid = currentPaid + dto.amount;

    if (newPaid > totalAmount) {
      throw new BadRequestException(`Pagamento excede o valor da fatura. Restante: R$ ${(totalAmount - currentPaid).toFixed(2)}`);
    }

    const payment = await this.prisma.invoicePayment.create({
      data: {
        invoiceId,
        paymentDate: new Date(dto.paymentDate),
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        bankAccount: dto.bankAccount,
        reference: dto.reference,
        notes: dto.notes,
      },
    });

    // Update invoice paid amount and status
    let newStatus: string;
    if (newPaid >= totalAmount) {
      newStatus = 'PAID';
    } else if (newPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    } else {
      newStatus = 'OPEN';
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaid, status: newStatus as any },
    });

    return payment;
  }

  async changeStatus(companyId: string, id: string, status: string) {
    await this.get(companyId, id);
    return this.prisma.invoice.update({ where: { id }, data: { status: status as any } });
  }

  async getStats(companyId: string) {
    const [total, open, overdue, paid, totalAmount, paidAmount] = await Promise.all([
      this.prisma.invoice.count({ where: { companyId } }),
      this.prisma.invoice.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.invoice.count({ where: { companyId, status: 'OVERDUE' } }),
      this.prisma.invoice.count({ where: { companyId, status: 'PAID' } }),
      this.prisma.invoice.aggregate({ where: { companyId }, _sum: { amount: true } }),
      this.prisma.invoice.aggregate({ where: { companyId }, _sum: { paidAmount: true } }),
    ]);
    return {
      total,
      open,
      overdue,
      paid,
      totalAmount: Number(totalAmount._sum.amount || 0),
      paidAmount: Number(paidAmount._sum.paidAmount || 0),
    };
  }

  async getOverdue(companyId: string) {
    const now = new Date();
    // Also update OPEN invoices past due date to OVERDUE
    await this.prisma.invoice.updateMany({
      where: { companyId, status: 'OPEN', dueDate: { lt: now } },
      data: { status: 'OVERDUE' },
    });

    return this.prisma.invoice.findMany({
      where: { companyId, status: 'OVERDUE' },
      include: { customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  // ─── AÇÕES DE COBRANÇA ───

  async addCollectionAction(invoiceId: string, userId: string | undefined, dto: any) {
    return this.prisma.collectionAction.create({
      data: {
        invoiceId,
        performedById: userId,
        type: dto.type,
        actionDate: new Date(dto.actionDate || new Date()),
        description: dto.description,
        result: dto.result,
        nextActionDate: dto.nextActionDate ? new Date(dto.nextActionDate) : null,
      },
    });
  }

  async listCollectionActions(invoiceId: string) {
    return this.prisma.collectionAction.findMany({
      where: { invoiceId },
      orderBy: { actionDate: 'desc' },
      include: { performedBy: { select: { name: true } } },
    });
  }

  // ─── INADIMPLÊNCIA ───

  async createDefaulterRecord(customerId: string, dto: any) {
    return this.prisma.defaulterRecord.create({
      data: { customerId, startDate: new Date(dto.startDate || new Date()), totalDebt: dto.totalDebt, reason: dto.reason },
    });
  }

  async listDefaulters(companyId: string) {
    return this.prisma.defaulterRecord.findMany({
      where: { customer: { companyId }, isResolved: false },
      include: { customer: { select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true } }, agreement: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async resolveDefaulter(id: string) {
    return this.prisma.defaulterRecord.update({ where: { id }, data: { isResolved: true, endDate: new Date() } });
  }

  // ─── ACORDOS ───

  async createAgreement(defaulterRecordId: string, dto: any) {
    return this.prisma.paymentAgreement.create({
      data: {
        defaulterRecordId,
        agreementDate: new Date(dto.agreementDate || new Date()),
        originalDebt: dto.originalDebt,
        discountPercent: dto.discountPercent,
        finalAmount: dto.finalAmount,
        installments: dto.installments,
        notes: dto.notes,
      },
    });
  }
}
