import { Body, Controller, Get, Param, Post, UseGuards, Patch, Delete, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Role } from 'generated/prisma';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleService } from './vehicle.service';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('vehicle')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService, private cloudinaryService: CloudinaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.createVehicle(dto);
  }

  @Get()
  getAllVehicles(@Query() filter: FilterVehicleDto) {
  return this.vehicleService.getAllVehicles(filter);
  }

  

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  updateVehicleById(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
  return this.vehicleService.updateVehicleById(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  deleteVehicleById(@Param('id') id: string) {
  return this.vehicleService.deleteVehicleById(id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVehicleImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.cloudinaryService.uploadImage(file.buffer);
    return { imageUrl };
  }

  @Get('locations')
  getAllLocations() {
  return this.vehicleService.getAllLocations();
}

@Get('available')
getAvailableVehicles(@Query() filter: FilterVehicleDto) {
  return this.vehicleService.getAllVehicles(filter);
}


@Get(':id')
  getVehicleById(@Param('id') id: string) {
  return this.vehicleService.getVehicleById(id);
  }
  
}
