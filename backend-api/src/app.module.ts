import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLogModule } from './modules/error-log/error-log.module';
import { RfidActivityModule } from './modules/rfid-activity/rfid-activity.module';
import { RfidCardModule } from './modules/rfid-card/rfid-card.module';
import { RfidLogModule } from './modules/rfid-log/rfid-log.module';
import { RfidReaderModule } from './modules/rfid-reader/rfid-reader.module';
import { RfidReaderGroupModule } from './modules/rfid-reader-group/rfid-reader-group.module';
import { RfidStatsModule } from './modules/rfid-stats/rfid-stats.module';
import { StaffModule } from './modules/staff/staff.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'rfid',
      password: 'rfidpass',
      database: 'rfid_db',
      synchronize: false,
      migrationsRun: false,
      autoLoadEntities: true,
    }),
    AuthModule,
    ErrorLogModule,
    RfidActivityModule,
    RfidCardModule,
    RfidLogModule,
    RfidReaderModule,
    RfidReaderGroupModule,
    RfidStatsModule,
    StaffModule,
    TenantModule,
    VehicleModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
