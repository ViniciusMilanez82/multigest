import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      totalAssets,
      activeContracts,
      totalVehicles,
      openInvoices,
      overdueInvoices,
      paidThisMonth,
      revenueThisMonth,
      recentContracts,
      overdueList,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { companyId, deletedAt: null } }),
      this.prisma.asset.count({ where: { companyId, deletedAt: null } }),
      this.prisma.contract.count({ where: { companyId, status: 'ACTIVE', deletedAt: null } }),
      this.prisma.vehicle.count({ where: { companyId, deletedAt: null } }),
      this.prisma.invoice.count({ where: { companyId, status: { in: ['OPEN', 'PARTIALLY_PAID'] } } }),
      this.prisma.invoice.count({ where: { companyId, status: 'OVERDUE' } }),
      this.prisma.invoicePayment.count({
        where: {
          invoice: { companyId },
          paymentDate: { gte: startOfMonth },
        },
      }),
      this.prisma.invoicePayment.aggregate({
        where: {
          invoice: { companyId },
          paymentDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.contract.findMany({
        where: { companyId, deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { razaoSocial: true, nomeFantasia: true } } },
      }),
      this.prisma.invoice.findMany({
        where: { companyId, status: 'OVERDUE' },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: { customer: { select: { razaoSocial: true, nomeFantasia: true } } },
      }),
    ]);

    // Monthly revenue for chart (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const result = await this.prisma.invoicePayment.aggregate({
        where: {
          invoice: { companyId },
          paymentDate: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });
      monthlyRevenue.push({
        month: start.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        value: Number(result._sum.amount || 0),
      });
    }

    return {
      totalCustomers,
      totalAssets,
      activeContracts,
      totalVehicles,
      openInvoices,
      overdueInvoices,
      paidThisMonth,
      revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
      recentContracts,
      overdueList,
      monthlyRevenue,
    };
  }

  async getExpeditionPanel(companyId: string, query: { start?: string; end?: string } = {}) {
    const start = query.start ? new Date(query.start) : new Date();
    const end = query.end ? new Date(query.end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const items = await this.prisma.contractItem.findMany({
      where: {
        contract: { companyId, deletedAt: null, status: { in: ['ACTIVE', 'DRAFT'] } },
        isActive: true,
        scheduledDeliveryDate: { gte: start, lte: end },
      },
      include: {
        contract: {
          include: {
            customer: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
          },
        },
        asset: { include: { assetType: true } },
      },
      orderBy: { scheduledDeliveryDate: 'asc' },
    });

    return items.map((it) => ({
      id: it.id,
      contractId: it.contractId,
      contractNumber: it.contract.contractNumber,
      customer: it.contract.customer.razaoSocial || it.contract.customer.nomeFantasia,
      assetCode: it.asset?.code,
      assetType: it.asset?.assetType?.name,
      scheduledDeliveryDate: it.scheduledDeliveryDate,
      deliveryBlockedReason: it.deliveryBlockedReason,
      isBlocked: !!it.deliveryBlockedReason,
      contractSignedAt: it.contract.contractSignedAt,
    }));
  }
}
