import { Controller, Get, Post, Put, Patch, Body, Param, Query, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { CreateFromContractDto } from './dto/create-from-contract.dto';
import { CreateCollectionActionDto } from './dto/create-collection-action.dto';
import { CreateDefaulterDto, CreateAgreementDto } from './dto/create-defaulter.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Headers('x-company-id') companyId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(companyId, dto);
  }

  @Post('from-contract')
  createFromContract(@Headers('x-company-id') companyId: string, @Body() dto: CreateFromContractDto) {
    return this.invoicesService.createFromContract(companyId, dto);
  }

  @Get()
  list(@Headers('x-company-id') companyId: string, @Query() query: any) {
    return this.invoicesService.list(companyId, query);
  }

  @Get('stats')
  getStats(@Headers('x-company-id') companyId: string) {
    return this.invoicesService.getStats(companyId);
  }

  @Get('overdue')
  getOverdue(@Headers('x-company-id') companyId: string) {
    return this.invoicesService.getOverdue(companyId);
  }

  @Get('next-number')
  getNextNumber(@Headers('x-company-id') companyId: string) {
    return this.invoicesService.getNextInvoiceNumber(companyId);
  }

  @Get(':id')
  get(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.invoicesService.get(companyId, id);
  }

  @Put(':id')
  update(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(companyId, id, dto);
  }

  @Post(':id/payments')
  addPayment(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: AddPaymentDto) {
    return this.invoicesService.addPayment(companyId, id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() body: { status: string }) {
    return this.invoicesService.changeStatus(companyId, id, body.status);
  }

  // ─── AÇÕES DE COBRANÇA ───

  @Post(':id/collection-actions')
  addCollectionAction(@Headers('x-company-id') companyId: string, @Param('id') invoiceId: string, @Req() req: any, @Body() dto: CreateCollectionActionDto) {
    return this.invoicesService.addCollectionAction(invoiceId, req.user?.sub, dto);
  }

  @Get(':id/collection-actions')
  listCollectionActions(@Headers('x-company-id') companyId: string, @Param('id') invoiceId: string) {
    return this.invoicesService.listCollectionActions(invoiceId);
  }

  // ─── INADIMPLÊNCIA ───

  @Get('defaulters/list')
  listDefaulters(@Headers('x-company-id') companyId: string) {
    return this.invoicesService.listDefaulters(companyId);
  }

  @Post('defaulters')
  createDefaulter(@Headers('x-company-id') companyId: string, @Body() dto: CreateDefaulterDto) {
    return this.invoicesService.createDefaulterRecord(dto.invoiceId, dto);
  }

  @Patch('defaulters/:id/resolve')
  resolveDefaulter(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.invoicesService.resolveDefaulter(id);
  }

  @Post('defaulters/:id/agreement')
  createAgreement(@Headers('x-company-id') companyId: string, @Param('id') defaulterRecordId: string, @Body() dto: CreateAgreementDto) {
    return this.invoicesService.createAgreement(defaulterRecordId, dto);
  }
}
