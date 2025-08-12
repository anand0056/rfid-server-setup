import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidReaderController } from './rfid-reader.controller';
import { RfidReaderService } from './rfid-reader.service';
import { RfidReader } from './rfid-reader.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RfidReader])],
  controllers: [RfidReaderController],
  providers: [RfidReaderService],
  exports: [RfidReaderService],
})
export class RfidReaderModule {}
