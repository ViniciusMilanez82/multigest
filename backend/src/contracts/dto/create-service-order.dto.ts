import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateServiceOrderDto {
  @ApiProperty()
  @IsString()
  contractId: string;

  @ApiProperty({ enum: ['INSTALACAO', 'RETIRADA', 'REMOCAO', 'TROCA_AR', 'MANUTENCAO'] })
  @IsEnum(['INSTALACAO', 'RETIRADA', 'REMOCAO', 'TROCA_AR', 'MANUTENCAO'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  freightValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  extraTax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  emitNf?: boolean;
}
