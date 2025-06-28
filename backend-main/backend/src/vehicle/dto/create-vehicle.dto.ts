import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsString()
  category: string;

  @IsNumber()
  pricePerDay: number;

  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsString()
  transmission: string;

  @IsString()
  fuelType: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
