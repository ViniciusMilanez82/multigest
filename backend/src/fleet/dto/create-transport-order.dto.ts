import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum TransportOrderType { DELIVERY = 'DELIVERY', PICKUP = 'PICKUP', TRANSFER = 'TRANSFER' }

export class CreateTransportOrderDto {
  @ApiProperty({ example: 'OT-2026-001' })
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @ApiProperty({ enum: TransportOrderType })
  @IsNotEmpty()
  @IsEnum(TransportOrderType)
  type: TransportOrderType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  origin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
