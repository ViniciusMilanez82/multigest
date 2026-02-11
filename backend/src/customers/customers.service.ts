import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { companyId_cpfCnpj: { companyId, cpfCnpj: dto.cpfCnpj } },
    });
    if (existing) {
      throw new ConflictException('CPF/CNPJ já cadastrado nesta empresa');
    }

    return this.prisma.customer.create({
      data: { ...dto, companyId },
      include: { addresses: true, contacts: true },
    });
  }

  async findAll(companyId: string, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        companyId,
        isActive: true,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { razaoSocial: { contains: search, mode: 'insensitive' } },
                { nomeFantasia: { contains: search, mode: 'insensitive' } },
                { cpfCnpj: { contains: search } },
                { code: { contains: search } },
              ],
            }
          : {}),
      },
      include: { addresses: true, contacts: true },
      orderBy: { razaoSocial: 'asc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        contacts: true,
        contracts: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: {
          where: { status: { in: ['OPEN', 'OVERDUE'] } },
          take: 10,
          orderBy: { dueDate: 'asc' },
        },
      },
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
      include: { addresses: true, contacts: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
