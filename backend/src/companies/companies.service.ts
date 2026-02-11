import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
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

  async findAll(companyIds: string[]) {
    if (!companyIds.length) return [];
    return this.prisma.company.findMany({
      where: { id: { in: companyIds }, isActive: true },
      orderBy: { razaoSocial: 'asc' },
    });
  }

  async findOne(id: string, companyIds: string[]) {
    if (!companyIds.length || !companyIds.includes(id)) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto, companyIds: string[]) {
    if (!companyIds.length || !companyIds.includes(id)) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string, companyIds: string[]) {
    if (!companyIds.length || !companyIds.includes(id)) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
