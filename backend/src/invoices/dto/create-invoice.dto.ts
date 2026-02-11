import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiProperty({ example: 'NF-2026-001' })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Início do período de faturamento' })
  @IsOptional()
  @IsDateString()
  billingPeriodStart?: string;

  @ApiPropertyOptional({ description: 'Fim do período de faturamento' })
  @IsOptional()
  @IsDateString()
  billingPeriodEnd?: string;

  @ApiProperty({ example: 5000.00 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
