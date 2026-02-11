import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { cnpj: dto.cnpj },
    });
    if (existing) {
      throw new ConflictException('CNPJ já cadastrado');
    }
    return this.prisma.company.create({ data: dto });
  }

  async findAll() {
    return this.prisma.company.findMany({
      where: { isActive: true },
      orderBy: { razaoSocial: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
