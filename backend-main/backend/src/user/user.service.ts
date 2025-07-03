import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { SystemStatsDto } from './dto/system-stats.dto';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserById(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const passwordMatches = await bcrypt.compare(dto.currentPassword, user.password);
  if (!passwordMatches) {
    throw new ForbiddenException('Current password is incorrect');
  }

  const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

  await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: 'Password updated successfully' };
 }

 async getRentalHistory(userId: string) {
  return this.prisma.booking.findMany({
    where: { userId },
    include: {
      vehicle: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
 }

 
 async getSystemStats(): Promise<SystemStatsDto> {
  const [totalUsers, admins, agents, customers, totalBookings, totalVehicles] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.user.count({ where: { role: 'ADMIN' } }),
    this.prisma.user.count({ where: { role: 'AGENT' } }),
    this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
    this.prisma.booking.count(),
    this.prisma.vehicle.count(),
  ]);

  const activeRentals = await this.prisma.booking.count({
    where: {
      status: 'CONFIRMED',
      endDate: { gt: new Date() },
    },
  });

  const revenueAgg = await this.prisma.booking.aggregate({
    where: { status: 'CONFIRMED' },
    _sum: { totalPrice: true },
  });

  return {
    totalUsers,
    admins,
    agents,
    customers,
    totalBookings,
    totalVehicles,
    activeRentals,
    totalRevenue: revenueAgg._sum.totalPrice ?? 0,
  };
 }


 async filterUsers(dto: FilterUsersDto) {
  const { role, startDate, endDate, search } = dto;

  const where: Prisma.UserWhereInput = {
    ...(role && { role }),
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return this.prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
 }

}
