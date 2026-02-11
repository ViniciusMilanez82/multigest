import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateContractAnalysisDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proposalNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  proposalDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressCnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressInstall?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactComercial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactFinanceiro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactRecebimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsible?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  witness?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  equipmentModels?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  monthlyValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  monthsRental?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedExit?: string;
}
