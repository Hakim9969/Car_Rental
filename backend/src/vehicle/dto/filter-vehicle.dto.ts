import {
  IsOptional,
  IsString,
  IsBooleanString,
  IsNumberString,
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
}
