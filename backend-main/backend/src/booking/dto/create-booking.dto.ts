import {
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
