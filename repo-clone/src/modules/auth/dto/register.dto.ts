// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export enum UserRole {
  Editor = 'editor',
  Admin = 'admin',
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}
