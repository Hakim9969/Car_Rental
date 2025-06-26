import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles(Role.ADMIN, Role.AGENT, Role.CUSTOMER)
  getProfile(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.userService.getUserById(user.userId);
  }

  @Patch('me')
  @Roles(Role.ADMIN, Role.AGENT, Role.CUSTOMER)
  updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req.user as { userId: string };
    return this.userService.updateUserById(user.userId, dto);
  }

  @Patch('change-password')
@Roles(Role.ADMIN, Role.AGENT, Role.CUSTOMER)
changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
  const user = req.user as { userId: string };
  return this.userService.changePassword(user.userId, dto);
}
}
