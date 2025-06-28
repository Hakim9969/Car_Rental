import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must be in international format starting with +',
  })
  phone?: string;
}
