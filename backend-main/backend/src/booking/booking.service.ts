import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Booking } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

@Injectable()
export class BookingService {

    private readonly logger = new Logger(BookingService.name);
  
    constructor(private readonly prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const { vehicleId, startDate, endDate } = dto;

    // Check if vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Check for overlapping bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    if (overlapping) throw new BadRequestException('Vehicle is already booked for these dates');

    // Create booking
    return this.prisma.booking.create({
      data: {
        userId,
        vehicleId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PENDING',
         },
    });
 }

 async getBookingsForUser(userId: string) {
  return this.prisma.booking.findMany({
    where: { userId },
    include: {
      vehicle: true, // Include related vehicle info
    },
    orderBy: { createdAt: 'desc' },
    });
   }

   async updateBookingStatus(id: string, dto: UpdateBookingStatusDto) {
  const booking = await this.prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new NotFoundException('Booking not found');

  if (booking.status !== 'PENDING') {
    throw new BadRequestException('Only pending bookings can be updated');
  }

  return this.prisma.booking.update({
    where: { id },
    data: { status: dto.status },
  });
 }

 async cancelBooking(userId: string, bookingId: string) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new NotFoundException('Booking not found');
  if (booking.userId !== userId)
    throw new ForbiddenException('You can only cancel your own bookings');

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new BadRequestException('Only pending or confirmed bookings can be canceled');
  }

  await this.prisma.booking.delete({ where: { id: bookingId } });

  return { message: 'Booking canceled successfully' };
  }

  async generateInvoice(bookingId: string): Promise<string> {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      vehicle: true,
    },
  });

  if (!booking) throw new NotFoundException('Booking not found');

  const { user, vehicle, status, startDate, endDate, createdAt } = booking;

  return `
    <html>
      <head>
        <title>Booking Invoice</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { padding: 8px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <h1>Booking Invoice</h1>
        <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${status}</p>

        <h2>Customer Info</h2>
        <p>${user.name} (${user.email})</p>

        <h2>Vehicle</h2>
        <p>${vehicle.brand} - ${vehicle.model} (${vehicle.category})</p>

        <h2>Booking Details</h2>
        <table>
          <tr>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Booking ID</th>
          </tr>
          <tr>
            <td>${new Date(startDate).toLocaleDateString()}</td>
            <td>${new Date(endDate).toLocaleDateString()}</td>
            <td>${booking.id}</td>
          </tr>
        </table>
      </body>
    </html>
  `;
 }


 @Cron(CronExpression.EVERY_10_MINUTES)
  async expirePendingBookings() {
    const expiryMinutes = 12 * 60;
    const cutoff = new Date(Date.now() - expiryMinutes * 60_000);

    const expired = await this.prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
      },
      data: {
        status: 'CANCELLED',
      },
    });

    if (expired.count > 0) {
      this.logger.warn(`⏱ Auto-cancelled ${expired.count} expired bookings`);
    }
  }


  async filterBookings(dto: FilterBookingsDto) {
  const { status, startDate, endDate, userId, vehicleId } = dto;

  return this.prisma.booking.findMany({
    where: {
      ...(status && { status }),
      ...(userId && { userId }),
      ...(vehicleId && { vehicleId }),
      ...(startDate && endDate && {
        startDate: { gte: new Date(startDate) },
        endDate: { lte: new Date(endDate) },
      }),
    },
    include: {
      user: true,
      vehicle: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
 }

}
