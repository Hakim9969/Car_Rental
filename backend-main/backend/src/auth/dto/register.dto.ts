import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';
import { Role } from 'generated/prisma';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'Phone number must be valid',
  })
  phone?: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
  

  @IsNotEmpty()
  confirmPassword: string;

  @IsEnum(Role)
  role: Role;
}
