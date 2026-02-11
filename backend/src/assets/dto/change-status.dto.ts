import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  IN_TRANSIT = 'IN_TRANSIT',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export class ChangeStatusDto {
  @ApiProperty({ enum: AssetStatus, example: 'IN_MAINTENANCE' })
  @IsNotEmpty({ message: 'Novo status é obrigatório' })
  @IsEnum(AssetStatus)
  newStatus: AssetStatus;

  @ApiPropertyOptional({ example: 'Manutenção preventiva programada' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'admin-user-id' })
  @IsOptional()
  @IsString()
  changedBy?: string;
}
