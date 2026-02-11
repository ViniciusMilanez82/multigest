import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  FINANCIAL = 'FINANCIAL',
  READONLY = 'READONLY',
}

export class RegisterDto {
  @ApiProperty({ example: 'Vinicius Milanez' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'admin@multigest.com.br' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: 'OPERATOR' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  companyId?: string;
}
