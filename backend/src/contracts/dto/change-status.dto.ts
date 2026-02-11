import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  CANCELLED = 'CANCELLED',
}

export class ChangeContractStatusDto {
  @ApiProperty({ enum: ContractStatus })
  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
