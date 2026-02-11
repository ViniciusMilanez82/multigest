import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { QueryProposalsDto } from './dto/query-proposals.dto';
import { ConvertToContractDto } from './dto/convert-to-contract.dto';

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly service: ProposalsService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get()
  list(
    @Headers('x-company-id') companyId: string,
    @Query() query: QueryProposalsDto,
  ) {
    return this.service.list(companyId, query);
  }

  @Get(':id')
  get(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.get(companyId, id);
  }

  @Put(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProposalDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  delete(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.delete(companyId, id);
  }

  @Patch(':id/send')
  send(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.send(companyId, id);
  }

  @Patch(':id/accept')
  accept(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.accept(companyId, id);
  }

  @Patch(':id/refuse')
  refuse(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.refuse(companyId, id);
  }

  @Post(':id/convert-to-contract')
  convertToContract(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: ConvertToContractDto,
  ) {
    return this.service.convertToContract(companyId, id, dto);
  }

  @Post(':id/convert-to-invoice')
  convertToInvoice(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.convertToInvoice(companyId, id);
  }
}
