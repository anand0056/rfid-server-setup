import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './vehicle.entity';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  async findAll(@Query('tenantId') tenantId?: string) {
    try {
      const parsedTenantId = tenantId ? +tenantId : undefined;
      const vehicle = await this.vehicleService.findAll(parsedTenantId);
      return vehicle;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vehicles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getStats(@Query('tenantId') tenantId?: string) {
    const parsedTenantId = tenantId ? +tenantId : undefined;
    return this.vehicleService.getVehicleStats(parsedTenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(+id);
  }

  @Get('license/:licensePlate')
  async findByLicensePlate(
    @Param('licensePlate') licensePlate: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const parsedTenantId = tenantId ? +tenantId : undefined;
    return this.vehicleService.findByLicensePlate(licensePlate, parsedTenantId);
  }

  @Post()
  async create(@Body() vehicleData: Partial<Vehicle>) {
    return this.vehicleService.create(vehicleData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Vehicle>) {
    return this.vehicleService.update(+id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.vehicleService.delete(+id);
  }

  @Post(':id/assign-card')
  async assignCard(@Param('id') id: string, @Body('cardUid') cardUid: string) {
    return this.vehicleService.assignCard(+id, cardUid);
  }

  @Post('unassign-card')
  async unassignCard(@Body('cardUid') cardUid: string) {
    return this.vehicleService.unassignCard(cardUid);
  }
}
