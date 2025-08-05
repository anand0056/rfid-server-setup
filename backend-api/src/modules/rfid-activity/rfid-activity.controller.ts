import { Controller, Get, Query } from '@nestjs/common';
import { RfidActivityService } from './rfid-activity.service';

@Controller('api/rfid/activity')
export class RfidActivityController {
  constructor(private readonly rfidActivityService: RfidActivityService) {}

  @Get('recent')
  async getRecentActivity(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rfidActivityService.getRecentActivity(
      tenantId ? +tenantId : undefined,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
