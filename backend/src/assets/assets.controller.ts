import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Ativos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ativo' })
  create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ativos' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'condition', required: false })
  @ApiQuery({ name: 'assetTypeId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: QueryAssetsDto,
  ) {
    return this.assetsService.findAll(companyId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo do inventário de ativos' })
  getInventorySummary(@Headers('x-company-id') companyId: string) {
    return this.assetsService.getInventorySummary(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ativo por ID' })
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.assetsService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ativo' })
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do ativo' })
  changeStatus(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.assetsService.changeStatus(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Descomissionar ativo (soft delete)' })
  decommission(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.assetsService.decommission(companyId, id, dto);
  }
}
