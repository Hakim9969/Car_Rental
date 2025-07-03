import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const { vehicleId, rating, comment } = dto;

    // Ensure the vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Ensure the user has a confirmed/approved booking for this vehicle
    const hasBooking = await this.prisma.booking.findFirst({
      where: {
        userId,
        vehicleId,
        status: { in: ['COMPLETED'] },
        // endDate: {
        //   lte: new Date(),
        // },
      },
    });

    if (!hasBooking) {
      throw new BadRequestException('You must complete a booking to review this vehicle');
    }

    return this.prisma.review.create({
      data: {
        userId,
        vehicleId,
        rating,
        comment,
      },
    });
  }

  async getVehicleReviews(vehicleId: string) {
    return this.prisma.review.findMany({
      where: { vehicleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
