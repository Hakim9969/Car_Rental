import { Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';

@Injectable()
export class VehicleService {
    constructor(private readonly prisma: PrismaService) {}

  async createVehicle(dto: CreateVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.create({ data: dto });
  }

  async getAllVehicles(filter?: FilterVehicleDto): Promise<Vehicle[]> {
  const { category, brand, available, minPrice, maxPrice, startDate, endDate,location, search } = filter || {};

  const vehicles = await this.prisma.vehicle.findMany({
    where: {
    AND: [
      category ? { category: { contains: category, mode: 'insensitive' } } : {},
      brand ? { brand: { contains: brand, mode: 'insensitive' } } : {},
      location ? { location: { contains: location, mode: 'insensitive' } } : {},
      available !== undefined ? { available: available === 'true' } : {},
      minPrice || maxPrice
        ? {
            pricePerDay: {
              gte: minPrice ? parseFloat(minPrice) : undefined,
              lte: maxPrice ? parseFloat(maxPrice) : undefined,
            },
          }
        : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  },
  include: {
    bookings:
      startDate && endDate
        ? {
            where: {
              OR: [
                {
                  startDate: { lte: new Date(endDate) },
                  endDate: { gte: new Date(startDate) },
                },
              ],
              status: { in: ['PENDING', 'CONFIRMED'] },
            },
          }
        : undefined,
  },
});


  // Exclude vehicles with overlapping bookings
  if (startDate && endDate) {
    return vehicles.filter((v) => v.bookings.length === 0);
  }

  return vehicles;
 }

  async getVehicleById(id: string): Promise<Vehicle> {
  const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new NotFoundException('Vehicle not found');
  return vehicle;
  }

  async updateVehicleById(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
  const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new NotFoundException('Vehicle not found');

  return this.prisma.vehicle.update({
    where: { id },
    data: dto,
  });
  }

  async deleteVehicleById(id: string): Promise<{ message: string }> {
  const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new NotFoundException('Vehicle not found');

  await this.prisma.vehicle.delete({ where: { id } });

  return { message: 'Vehicle deleted successfully' };
 }

  async getAllLocations(): Promise<string[]> {
  const locations = await this.prisma.vehicle.findMany({
    select: { location: true },
    distinct: ['location'],
  });

  // Filter out null or empty strings manually
  return locations
    .map((l) => l.location)
    .filter((loc): loc is string => !!loc && loc.trim() !== '');
}




}
