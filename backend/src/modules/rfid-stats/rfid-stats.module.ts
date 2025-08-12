import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidStatsController } from './rfid-stats.controller';
import { RfidStatsService } from './rfid-stats.service';
import { RfidLog } from '../rfid-log/rfid-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RfidLog])],
  controllers: [RfidStatsController],
  providers: [RfidStatsService],
  exports: [RfidStatsService],
})
export class RfidStatsModule {}
