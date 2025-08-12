import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidLogController } from './rfid-log.contoller';
import { RfidLogService } from './rfid-log.service';
import { RfidLog } from './rfid-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RfidLog])],
  controllers: [RfidLogController],
  providers: [RfidLogService],
  exports: [RfidLogService],
})
export class RfidLogModule {}
