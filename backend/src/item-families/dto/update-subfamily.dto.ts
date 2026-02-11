import { PartialType } from '@nestjs/swagger';
import { CreateSubfamilyDto } from './create-subfamily.dto';

export class UpdateSubfamilyDto extends PartialType(CreateSubfamilyDto) {}
