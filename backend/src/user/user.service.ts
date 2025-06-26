import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

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
}
