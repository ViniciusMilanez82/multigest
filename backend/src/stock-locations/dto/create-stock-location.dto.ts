import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockLocationDto {
  @ApiProperty({ example: 'Pátio Central' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Rua das Indústrias, 500 - Curitiba/PR' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'ID do cliente (se o local é um cliente)' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
