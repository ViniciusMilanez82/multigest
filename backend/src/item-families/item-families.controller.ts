import {
  Controller,
  Get,
  Post,
  Put,
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
import { ItemFamiliesService } from './item-families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { CreateSubfamilyDto } from './dto/create-subfamily.dto';
import { UpdateSubfamilyDto } from './dto/update-subfamily.dto';

@ApiTags('Item Families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('item-families')
export class ItemFamiliesController {
  constructor(private readonly service: ItemFamiliesService) {}

  @Post()
  createFamily(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateFamilyDto,
  ) {
    return this.service.createFamily(companyId, dto);
  }

  @Get()
  listFamilies(
    @Headers('x-company-id') companyId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.service.listFamilies(companyId, includeInactive === 'true');
  }

  @Get(':id')
  getFamily(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.getFamily(companyId, id);
  }

  @Put(':id')
  updateFamily(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFamilyDto,
  ) {
    return this.service.updateFamily(companyId, id, dto);
  }

  @Delete(':id')
  removeFamily(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.removeFamily(companyId, id);
  }

  @Post(':familyId/subfamilies')
  createSubfamily(
    @Headers('x-company-id') companyId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateSubfamilyDto,
  ) {
    return this.service.createSubfamily(companyId, familyId, dto);
  }

  @Get(':familyId/subfamilies')
  listSubfamilies(
    @Headers('x-company-id') companyId: string,
    @Param('familyId') familyId: string,
  ) {
    return this.service.listSubfamilies(companyId, familyId);
  }
}

@ApiTags('Item Subfamilies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('item-subfamilies')
export class ItemSubfamiliesController {
  constructor(private readonly service: ItemFamiliesService) {}

  @Get()
  list(
    @Headers('x-company-id') companyId: string,
    @Query('familyId') familyId?: string,
  ) {
    return this.service.listSubfamilies(companyId, familyId);
  }

  @Get(':id')
  get(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.getSubfamily(companyId, id);
  }

  @Put(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubfamilyDto,
  ) {
    return this.service.updateSubfamily(companyId, id, dto);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.removeSubfamily(companyId, id);
  }
}
