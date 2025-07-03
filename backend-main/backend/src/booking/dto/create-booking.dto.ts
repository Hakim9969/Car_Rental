import {
  IsString,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  location: string; 
}
