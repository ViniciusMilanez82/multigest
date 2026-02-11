import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { StockLocationsService } from './stock-locations.service';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';

@ApiTags('Stock Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('stock-locations')
export class StockLocationsController {
  constructor(private readonly service: StockLocationsService) {}

  @Post()
  create(@Headers('x-company-id') companyId: string, @Body() dto: CreateStockLocationDto) {
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
  update(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateStockLocationDto) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.remove(companyId, id);
  }

  // Mover ativo para um local
  @Post(':id/move-asset')
  moveAsset(
    @Headers('x-company-id') companyId: string,
    @Param('id') toLocationId: string,
    @Req() req: any,
    @Body() body: { assetId: string; movementType: string; notes?: string },
  ) {
    return this.service.moveAsset(companyId, body.assetId, toLocationId, body.movementType, body.notes, req.user?.id);
  }

  // Histórico de movimentação de um ativo
  @Get('asset/:assetId/history')
  getAssetHistory(@Param('assetId') assetId: string) {
    return this.service.getAssetLocationHistory(assetId);
  }
}
