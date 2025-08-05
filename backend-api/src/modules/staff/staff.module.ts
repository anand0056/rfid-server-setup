import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { Staff } from './staff.entity';
import { RfidCard } from '../rfid-card/rfid-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, RfidCard])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
