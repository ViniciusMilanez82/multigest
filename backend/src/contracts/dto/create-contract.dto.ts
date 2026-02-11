import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
}

enum ContractType {
  ANTECIPADO = 'ANTECIPADO',
  MEDICAO = 'MEDICAO',
  AUTOMATICO = 'AUTOMATICO',
}

class CreateContractItemDto {
  @ApiProperty({ example: 'uuid-do-ativo' })
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  dailyRate: number;

  @ApiPropertyOptional({ example: 4500.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  monthlyRate?: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Data de saída do container — cobrança começa aqui' })
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateContractDto {
  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'CTR-2026-001' })
  @IsNotEmpty({ message: 'Número do contrato é obrigatório' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ enum: ContractType, default: 'MEDICAO', description: 'Tipo: ANTECIPADO, MEDICAO, AUTOMATICO' })
  @IsNotEmpty({ message: 'Tipo de contrato é obrigatório' })
  @IsEnum(ContractType)
  type: ContractType;

  @ApiPropertyOptional({ enum: ContractStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '30 dias' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Boleto' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [CreateContractItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractItemDto)
  items?: CreateContractItemDto[];
}

export { CreateContractItemDto };
