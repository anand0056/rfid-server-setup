import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { RfidLogService } from '../services/rfid-log.service';

@Controller('api/rfid/logs')
export class RfidLogController {
  constructor(private readonly rfidLogService: RfidLogService) {}

  @Get()
  async getLogs(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('card_uid') cardUid?: string,
    @Query('reader_id') readerId?: string,
    @Query('card_type') cardType?: string,
    @Query('access_granted') accessGranted?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('search') search?: string,
    @Query('timezone') timezone?: string,
  ) {
    try {
      return await this.rfidLogService.getLogs({
        tenantId: tenantId ? +tenantId : undefined,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
        cardUid,
        readerId,
        cardType,
        accessGranted: accessGranted === 'true' ? true : accessGranted === 'false' ? false : undefined,
        dateFrom,
        dateTo,
        search,
        timezone,
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new HttpException(
        `Failed to fetch logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
