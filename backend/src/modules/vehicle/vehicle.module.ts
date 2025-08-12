import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './vehicle.entity';
import { RfidCard } from '../rfid-card/rfid-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, RfidCard])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
