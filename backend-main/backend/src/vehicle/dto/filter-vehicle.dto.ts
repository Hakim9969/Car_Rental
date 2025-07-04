import {
  IsOptional,
  IsString,
  IsBooleanString,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class FilterVehicleDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsBooleanString()
  available?: string; // expects "true" or "false" as strings

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

   @IsOptional()
  @IsString()
  location?: string;

}
