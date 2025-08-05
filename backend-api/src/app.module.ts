import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidStatsController } from './controllers/rfid-stats.controller';
import { RfidStatsService } from './services/rfid-stats.service';
import { RfidCardService } from './services/rfid-cards.service';
import { RfidCardController } from './controllers/rfid-card.controllers';
import { RfidReaderController } from './controllers/rfid-reader.controller';
import { RfidReaderService } from './services/rfid-reader.service';
import { RfidReaderGroupController } from './controllers/rfid-reader-group.controller';
import { RfidReaderGroupService } from './services/rfid-reader-group.service';
import { RfidLogController } from './controllers/rfid-log.contoller';
import { RfidLogService } from './services/rfid-log.service';
import { RfidActivityController } from './controllers/rfid-activity.controller';
import { RfidActivityService } from './services/rfid-activity.service';
import { VehicleController } from './controllers/vehicle.controller';
import { VehicleService } from './services/vehicle.service';
import { TenantController } from './controllers/tenant.controller';
import { TenantService } from './services/tenant.service';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';
import { ErrorLogController } from './controllers/error-log.controller';
import { ErrorLogService } from './services/error-log.service';
import { Tenant } from './entities/tenant.entity';
import { RfidReaderGroup } from './entities/rfid-reader-group.entity';
import { RfidCard } from './entities/rfid-card.entity';
import { RfidReader } from './entities/rfid-reader.entity';
import { RfidLog } from './entities/rfid-log.entity';
import { Staff } from './entities/staff.entity';
import { Vehicle } from './entities/vehicle.entity';
import { ErrorLog } from './entities/error-log.entity';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', //process.env.DB_HOST || 
      port: 3306,
      username: 'rfid', //process.env.DB_USER || 'rfid',
      password: 'rfidpass', //process.env.DB_PASSWORD || 'rfidpass',
      database: 'rfid_db', //process.env.DB_NAME || 'rfid_db',
      entities: [
        Tenant,
        RfidReaderGroup,
        RfidCard,
        RfidReader,
        RfidLog,
        Staff,
        Vehicle,
        ErrorLog,
      ],
      synchronize: false,     // important!
      migrationsRun: false,   // don't auto-run migrations
      autoLoadEntities: true, // optional; depends on how you manage entities
    }),
    TypeOrmModule.forFeature([
      Tenant,
      RfidReaderGroup,
      RfidCard,
      RfidReader,
      RfidLog,
      Staff,
      Vehicle,
      ErrorLog,
    ]),
    // Import other modules as needed
    AuthModule
  ],
  controllers: [
    RfidStatsController,
    RfidCardController,
    RfidReaderController,
    RfidReaderGroupController,
    RfidLogController,
    RfidActivityController,
    VehicleController,
    TenantController,
    StaffController,
    ErrorLogController,
    HealthController,
  ],
  providers: [
    RfidStatsService,
    RfidCardService,
    RfidReaderService,
    RfidReaderGroupService,
    RfidLogService,
    RfidActivityService,
    VehicleService,
    TenantService,
    StaffService,
    ErrorLogService,
  ],
})
export class AppModule { }
