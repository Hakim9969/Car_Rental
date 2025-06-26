import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  pricePerDay?: number;

  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
