import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Post()
  create(@Headers('x-company-id') companyId: string, @Body() dto: CreateSupplierDto) { return this.service.create(companyId, dto); }

  @Get()
  list(@Headers('x-company-id') companyId: string, @Query() query: any) { return this.service.list(companyId, query); }

  @Get(':id')
  get(@Headers('x-company-id') companyId: string, @Param('id') id: string) { return this.service.get(companyId, id); }

  @Put(':id')
  update(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateSupplierDto) { return this.service.update(companyId, id, dto); }

  @Delete(':id')
  remove(@Headers('x-company-id') companyId: string, @Param('id') id: string) { return this.service.remove(companyId, id); }
}
