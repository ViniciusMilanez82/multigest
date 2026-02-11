import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum BiddingStatus {
  ABERTA = 'ABERTA',
  EM_ANALISE = 'EM_ANALISE',
  ADJUDICADA = 'ADJUDICADA',
  CANCELADA = 'CANCELADA',
  ENCERRADA = 'ENCERRADA',
}

export class CreateBiddingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  number: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(BiddingStatus)
  status?: BiddingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  modality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  agency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  object?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateBiddingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(BiddingStatus)
  status?: BiddingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  modality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  agency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  object?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
