import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { Request } from 'express';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  createReview(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const user = req.user as { userId: string };
    return this.reviewsService.createReview(user.userId, dto);
  }

  @Get('vehicle/:vehicleId')
  getVehicleReviews(@Param('vehicleId') vehicleId: string) {
    return this.reviewsService.getVehicleReviews(vehicleId);
  }
}
