import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidReaderGroupController } from './rfid-reader-group.controller';
import { RfidReaderGroupService } from './rfid-reader-group.service';
import { RfidReaderGroup } from './rfid-reader-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RfidReaderGroup])],
  controllers: [RfidReaderGroupController],
  providers: [RfidReaderGroupService],
  exports: [RfidReaderGroupService],
})
export class RfidReaderGroupModule {}
