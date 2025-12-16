import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthSendVerificationDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}
