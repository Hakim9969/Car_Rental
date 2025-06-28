import { Body, Controller, Post, Req, UseGuards, Get, Param, Patch, Delete, Res, Query } from '@nestjs/common';
import { Role } from 'generated/prisma';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Request, Response } from 'express';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

@Controller('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  createBooking(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const user = req.user as { userId: string };
    return this.bookingService.createBooking(user.userId, dto);
  }

  @Get('me')
  @Roles(Role.CUSTOMER)
  etMyBookings(@Req() req: Request) {
  const user = req.user as { userId: string };
  return this.bookingService.getBookingsForUser(user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.AGENT)
  updateBookingStatus(
  @Param('id') id: string,
  @Body() dto: UpdateBookingStatusDto,
 ) {
  return this.bookingService.updateBookingStatus(id, dto);
 }

 @Delete(':id')
 @Roles(Role.CUSTOMER)
 cancelBooking(@Req() req: Request, @Param('id') id: string) {
  const user = req.user as { userId: string };
  return this.bookingService.cancelBooking(user.userId, id);
  }
  @Get(':id/invoice')
  @Roles(Role.ADMIN, Role.AGENT, Role.CUSTOMER)
  async getInvoice(@Param('id') id: string, @Res() res: Response) {
  const html = await this.bookingService.generateInvoice(id);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
 }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getFilteredBookings(@Query() dto: FilterBookingsDto) {
  return this.bookingService.filterBookings(dto);
}

}
