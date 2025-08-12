import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ErrorLogService } from './error-log.service';
import { ErrorLogQueryParams } from './error-log.service';

@Controller('error-logs')
export class ErrorLogController {
  constructor(private readonly errorLogService: ErrorLogService) {}

  @Get()
  async findAll(@Query() query: ErrorLogQueryParams) {
    return this.errorLogService.findAll(query);
  }

  @Get('stats')
  async getStats(@Query('tenantId') tenantId?: number) {
    return this.errorLogService.getStats(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.errorLogService.findOne(id);
  }

  @Post(':id/resolve')
  async markAsResolved(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { resolvedBy: string; resolutionNotes?: string },
  ) {
    return this.errorLogService.markAsResolved(
      id,
      body.resolvedBy,
      body.resolutionNotes,
    );
  }

  @Post(':id/unresolve')
  async markAsUnresolved(@Param('id', ParseIntPipe) id: number) {
    return this.errorLogService.markAsUnresolved(id);
  }
}
