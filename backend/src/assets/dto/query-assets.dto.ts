import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  IN_TRANSIT = 'IN_TRANSIT',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export class QueryAssetsDto {
  @ApiPropertyOptional({ example: 'EQP' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ enum: AssetCondition })
  @IsOptional()
  @IsEnum(AssetCondition)
  condition?: AssetCondition;

  @ApiPropertyOptional({ example: 'uuid-do-tipo' })
  @IsOptional()
  @IsString()
  assetTypeId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
