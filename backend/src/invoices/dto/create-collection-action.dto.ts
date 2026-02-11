import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum CollectionActionType {
  PHONE_CALL = 'PHONE_CALL',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
  VISIT = 'VISIT',
  PROTEST = 'PROTEST',
  LEGAL_ACTION = 'LEGAL_ACTION',
  OTHER = 'OTHER',
}

export class CreateCollectionActionDto {
  @ApiProperty({ enum: CollectionActionType })
  @IsEnum(CollectionActionType)
  type: CollectionActionType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactedPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  result?: string;
}
