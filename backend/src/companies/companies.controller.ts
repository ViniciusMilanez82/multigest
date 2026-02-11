import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar empresa' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas' })
  findAll(@Req() req: any) {
    const companyIds = (req.user?.companies || []).map((c: any) => c.id || c.companyId).filter(Boolean);
    return this.companiesService.findAll(companyIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    const companyIds = (req.user?.companies || []).map((c: any) => c.id || c.companyId).filter(Boolean);
    return this.companiesService.findOne(id, companyIds);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    const companyIds = (req.user?.companies || []).map((c: any) => c.id || c.companyId).filter(Boolean);
    return this.companiesService.update(id, dto, companyIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar empresa' })
  remove(@Req() req: any, @Param('id') id: string) {
    const companyIds = (req.user?.companies || []).map((c: any) => c.id || c.companyId).filter(Boolean);
    return this.companiesService.remove(id, companyIds);
  }
}
