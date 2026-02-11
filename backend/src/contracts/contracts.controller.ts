import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { AddContractItemDto } from './dto/add-item.dto';
import { ChangeContractStatusDto } from './dto/change-status.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CreateAddendumDto } from './dto/create-addendum.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';

@ApiTags('Contratos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar contrato' })
  create(@Headers('x-company-id') companyId: string, @Body() dto: CreateContractDto) {
    return this.contractsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Headers('x-company-id') companyId: string, @Query() query: QueryContractsDto) {
    return this.contractsService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar contrato por ID' })
  findOne(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.contractsService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  update(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do contrato' })
  changeStatus(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: ChangeContractStatusDto) {
    return this.contractsService.changeStatus(companyId, id, dto);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Adicionar item ao contrato' })
  addItem(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: AddContractItemDto) {
    return this.contractsService.addItem(companyId, id, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remover item do contrato' })
  removeItem(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.contractsService.removeItem(companyId, id, itemId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar contrato (soft delete)' })
  remove(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.contractsService.remove(companyId, id);
  }

  // ─── MEDIÇÕES ───

  @Post(':id/measurements')
  createMeasurement(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: CreateMeasurementDto) {
    return this.contractsService.createMeasurement(companyId, id, dto);
  }

  @Get(':id/measurements')
  listMeasurements(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.contractsService.listMeasurements(id);
  }

  @Patch('measurements/:measurementId/approve')
  approveMeasurement(@Headers('x-company-id') companyId: string, @Param('measurementId') id: string) {
    return this.contractsService.approveMeasurement(id);
  }

  // ─── MOVIMENTAÇÕES ───

  @Post(':id/movements')
  createMovement(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: CreateMovementDto) {
    return this.contractsService.createMovement(id, dto);
  }

  @Get(':id/movements')
  listMovements(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.contractsService.listMovements(id);
  }

  // ─── ADITIVOS ───

  @Post(':id/addendums')
  createAddendum(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: CreateAddendumDto) {
    return this.contractsService.createAddendum(id, dto);
  }

  @Get(':id/addendums')
  listAddendums(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.contractsService.listAddendums(id);
  }
}
