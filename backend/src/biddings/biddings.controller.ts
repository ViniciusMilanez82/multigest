import { Controller, Get, Post, Put, Patch, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { BiddingsService } from './biddings.service';
import { CreateBiddingDto, UpdateBiddingDto } from './dto/create-bidding.dto';

@ApiTags('Biddings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('biddings')
export class BiddingsController {
  constructor(private readonly service: BiddingsService) {}

  @Post()
  create(@Headers('x-company-id') companyId: string, @Body() dto: CreateBiddingDto) { return this.service.create(companyId, dto); }

  @Get()
  list(@Headers('x-company-id') companyId: string, @Query() query: any) { return this.service.list(companyId, query); }

  @Get(':id')
  get(@Headers('x-company-id') companyId: string, @Param('id') id: string) { return this.service.get(companyId, id); }

  @Put(':id')
  update(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateBiddingDto) { return this.service.update(companyId, id, dto); }

  @Patch(':id/status')
  changeStatus(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() body: { status: string }) { return this.service.changeStatus(companyId, id, body.status); }
}
