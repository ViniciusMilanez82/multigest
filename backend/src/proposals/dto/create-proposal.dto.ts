import { IsString, IsOptional, IsEnum, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProposalItemDto {
  @ApiPropertyOptional({ description: 'ID da subfamília (do cadastro)' })
  @IsOptional()
  @IsString()
  subfamilyId?: string;

  @ApiPropertyOptional({ description: 'Legado: tipo texto (maritimo, modulo, etc)' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Modelo ou complemento' })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional({ description: 'Descrição para exibição (família/subfamília + modelo)' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty()
  @IsNumber()
  quantidade: number;

  @ApiProperty()
  @IsNumber()
  valorUnitario: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  frete?: number;
}

export class CreateProposalDto {
  @ApiProperty({ enum: ['VENDA', 'LOCACAO', 'EVENTO'] })
  @IsEnum(['VENDA', 'LOCACAO', 'EVENTO'])
  type: 'VENDA' | 'LOCACAO' | 'EVENTO';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ type: [ProposalItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposalItemDto)
  items: ProposalItemDto[];
}
