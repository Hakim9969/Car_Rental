import { IsOptional, IsEnum, IsISO8601, IsString } from 'class-validator';
import { Role } from 'generated/prisma';

export class FilterUsersDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string; // for name or email
}
