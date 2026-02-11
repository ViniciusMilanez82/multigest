import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFuelRecordDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  fuelType?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  liters: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pricePerLiter?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  totalCost: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  km?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  station?: string;
}

export class CreateVehicleMaintenanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  type?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;
}

export class CreateChecklistDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  km?: number;

  @ApiPropertyOptional()
  @IsOptional()
  items?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
