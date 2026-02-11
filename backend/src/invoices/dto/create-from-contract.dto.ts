import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString, IsNumber, IsInt, MaxLength, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ContractItemBillingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contractItemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  excludedDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excludedReason?: string;
}

export class CreateFromContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contractId: string;

  @ApiPropertyOptional({ description: 'Se omitido, será gerado automaticamente (ex: 2026-0001)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty()
  @IsDateString()
  billingPeriodStart: string;

  @ApiProperty()
  @IsDateString()
  billingPeriodEnd: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ type: [ContractItemBillingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractItemBillingDto)
  items: ContractItemBillingDto[];
}
