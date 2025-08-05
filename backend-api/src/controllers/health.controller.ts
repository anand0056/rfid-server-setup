import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  async checkHealth() {
    try {
      // Check database connection
      const dbStatus = await this.connection.query('SELECT 1');
      const isDbConnected = !!dbStatus;

      // Get system info
      const usedMemory = process.memoryUsage();
      const uptime = process.uptime();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: uptime,
        memory: {
          heapUsed: Math.round(usedMemory.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(usedMemory.heapTotal / 1024 / 1024) + 'MB',
          rss: Math.round(usedMemory.rss / 1024 / 1024) + 'MB',
        },
        database: {
          connected: isDbConnected,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
