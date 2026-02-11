import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tipos de Ativo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-types')
export class AssetTypesController {
  constructor(private assetTypesService: AssetTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tipo de ativo' })
  create(@Body() dto: CreateAssetTypeDto) {
    return this.assetTypesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de ativo' })
  findAll() {
    return this.assetTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de ativo por ID' })
  findOne(@Param('id') id: string) {
    return this.assetTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de ativo' })
  update(@Param('id') id: string, @Body() dto: UpdateAssetTypeDto) {
    return this.assetTypesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar tipo de ativo' })
  remove(@Param('id') id: string) {
    return this.assetTypesService.remove(id);
  }
}
