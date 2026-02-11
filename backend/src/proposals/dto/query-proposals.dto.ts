import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProposalsDto {
  @ApiPropertyOptional({ enum: ['RASCUNHO', 'ENVIADA', 'ACEITA', 'RECUSADA', 'CONVERTIDA'] })
  @IsOptional()
  @IsEnum(['RASCUNHO', 'ENVIADA', 'ACEITA', 'RECUSADA', 'CONVERTIDA'])
  status?: string;

  @ApiPropertyOptional({ enum: ['VENDA', 'LOCACAO', 'EVENTO'] })
  @IsOptional()
  @IsEnum(['VENDA', 'LOCACAO', 'EVENTO'])
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
