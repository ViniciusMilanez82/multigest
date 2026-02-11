import { IsNotEmpty, IsOptional, IsString, IsInt, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_OPERATION = 'IN_OPERATION',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC-1234' })
  @IsNotEmpty({ message: 'Placa é obrigatória' })
  @IsString()
  plate: string;

  @ApiProperty({ example: 'Caminhão Munck' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Mercedes-Benz' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Atego 2430' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  renavam?: string;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  loadCapacityKg?: number;

  @ApiPropertyOptional({ example: 85000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentKm?: number;

  @ApiPropertyOptional({ enum: VehicleStatus, default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
