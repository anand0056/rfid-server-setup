import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RfidStatsService } from './rfid-stats.service';

@Controller('rfid/stats')
export class RfidStatsController {
  private readonly logger = new Logger(RfidStatsController.name);

  constructor(private readonly rfidStatsService: RfidStatsService) {}

  @Get()
  async getStats(
    @Query('tenantId') tenantId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('timezone') timezone?: string,
  ) {
    try {
      this.logger.log(
        `Getting stats with params: ${JSON.stringify(
          {
            tenantId,
            dateFrom,
            dateTo,
            timezone,
          },
          null,
          2,
        )}`,
      );

      return await this.rfidStatsService.getStats({
        tenantId: tenantId ? +tenantId : undefined,
        dateFrom,
        dateTo,
        timezone,
      });
    } catch (error) {
      this.logger.error(`Error getting stats: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to get stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard')
  async getDashboardStats(@Query('tenantId') tenantId?: string) {
    try {
      this.logger.log(`Getting dashboard stats with tenantId: ${tenantId}`);

      return await this.rfidStatsService.getDashboardStats({
        tenantId: tenantId ? +tenantId : undefined,
      });
    } catch (error) {
      this.logger.error(
        `Error getting dashboard stats: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Failed to get dashboard stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
