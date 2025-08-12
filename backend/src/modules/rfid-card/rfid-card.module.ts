import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidCardController } from './rfid-card.controllers';
import { RfidCardService } from './rfid-cards.service';
import { RfidCard } from './rfid-card.entity';
import { RfidReader } from '../rfid-reader/rfid-reader.entity';
import { Staff } from '../staff/staff.entity';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Tenant } from '../tenant/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RfidCard, RfidReader, Staff, Vehicle, Tenant])],
  controllers: [RfidCardController],
  providers: [RfidCardService],
  exports: [RfidCardService],
})
export class RfidCardModule {}
