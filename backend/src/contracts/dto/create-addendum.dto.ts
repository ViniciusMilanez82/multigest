import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum AddendumType {
  VALUE_CHANGE = 'VALUE_CHANGE',
  ITEM_ADDITION = 'ITEM_ADDITION',
  ITEM_REMOVAL = 'ITEM_REMOVAL',
  PERIOD_EXTENSION = 'PERIOD_EXTENSION',
  OTHER = 'OTHER',
}

export class CreateAddendumDto {
  @ApiProperty({ enum: AddendumType })
  @IsEnum(AddendumType)
  type: AddendumType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty()
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  newValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
