import { Controller, Get, Post, Put, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { ServiceOrdersService } from './service-orders.service';

@ApiTags('Ordens de Serviço')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly service: ServiceOrdersService) {}

  @Post()
  create(@Headers('x-company-id') companyId: string, @Body() dto: any) {
    return this.service.create(companyId, dto);
  }

  @Get()
  list(@Headers('x-company-id') companyId: string, @Query() query: any) {
    return this.service.list(companyId, query);
  }

  @Get(':id')
  get(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.get(companyId, id);
  }

  @Put(':id')
  update(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(companyId, id, dto);
  }
}
