import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  picture?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  photo: string | null;

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  statuses: string[];

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isUserQuestDone: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  team?: string | null;
}
