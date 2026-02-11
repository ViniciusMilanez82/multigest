import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString()
  cnpj: string;

  @ApiProperty({ example: 'Multi Macaé Locações Ltda' })
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @IsString()
  razaoSocial: string;

  @ApiPropertyOptional({ example: 'Multi Macaé' })
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @ApiPropertyOptional({ example: '(22) 2222-3333' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contato@multimacae.com.br' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Macaé' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'RJ' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  state?: string;

  @ApiPropertyOptional({ example: '27900-000' })
  @IsOptional()
  @IsString()
  zipCode?: string;
}
