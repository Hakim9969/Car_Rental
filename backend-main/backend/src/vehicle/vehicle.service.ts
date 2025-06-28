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
  const { category, brand, available, minPrice, maxPrice, startDate, endDate } = filter || {};

  const vehicles = await this.prisma.vehicle.findMany({
    where: {
      category: category || undefined,
      brand: brand || undefined,
      available: available !== undefined ? available === 'true' : undefined,
      pricePerDay: {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      },
    },
    include: {
      bookings: {
        where: startDate && endDate
          ? {
              OR: [
                {
                  startDate: { lte: new Date(endDate) },
                  endDate: { gte: new Date(startDate) },
                },
              ],
              status: { in: ['PENDING', 'CONFIRMED'] },
            }
          : undefined,
      },
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

}
