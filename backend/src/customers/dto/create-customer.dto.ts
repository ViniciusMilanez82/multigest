import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum PersonType {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
}

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: 'CLI-001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: PersonType, default: 'JURIDICA' })
  @IsOptional()
  @IsEnum(PersonType)
  type?: PersonType;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsNotEmpty({ message: 'CPF/CNPJ é obrigatório' })
  @IsString()
  cpfCnpj: string;

  @ApiProperty({ example: 'Petrobras S.A.' })
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @IsString()
  razaoSocial: string;

  @ApiPropertyOptional({ example: 'Petrobras' })
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

  @ApiPropertyOptional({ example: 'Petróleo e Gás' })
  @IsOptional()
  @IsString()
  segment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
