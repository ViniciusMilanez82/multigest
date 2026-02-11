import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  IN_TRANSIT = 'IN_TRANSIT',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export class CreateAssetDto {
  @ApiProperty({ example: 'uuid-do-tipo' })
  @IsNotEmpty({ message: 'Tipo do ativo é obrigatório' })
  @IsString()
  assetTypeId: string;

  @ApiProperty({ example: 'EQP-001' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'SN-123456' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  manufacturingYear?: number;

  @ApiPropertyOptional({ example: 'Caterpillar' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional({ example: 6.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  length?: number;

  @ApiPropertyOptional({ enum: AssetCondition, default: 'GOOD' })
  @IsOptional()
  @IsEnum(AssetCondition)
  condition?: AssetCondition;

  @ApiPropertyOptional({ enum: AssetStatus, default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ example: 'Pátio Central' })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({ example: 350.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  dailyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
