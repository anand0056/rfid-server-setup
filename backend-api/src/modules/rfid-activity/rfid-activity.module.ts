import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidActivityController } from './rfid-activity.controller';
import { RfidActivityService } from './rfid-activity.service';
import { RfidLog } from '../rfid-log/rfid-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RfidLog])],
  controllers: [RfidActivityController],
  providers: [RfidActivityService],
  exports: [RfidActivityService],
})
export class RfidActivityModule {}
