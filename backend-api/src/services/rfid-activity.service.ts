import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidLog } from '../entities/rfid-log.entity';

@Injectable()
export class RfidActivityService {
  private readonly logger = new Logger(RfidActivityService.name);

  constructor(
    @InjectRepository(RfidLog)
    private logRepository: Repository<RfidLog>,
  ) {}

  async getRecentActivity(tenantId?: number, limit: number = 20) {
    this.logger.log(`Getting recent activity for tenant ${tenantId}, limit ${limit}`);

    const query = this.logRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.card', 'card')
      .leftJoinAndSelect('card.staff', 'staff')
      .leftJoinAndSelect('card.vehicle', 'vehicle')
      .leftJoinAndSelect('log.reader', 'reader')
      .leftJoinAndSelect('log.tenant', 'tenant')
      .orderBy('log.timestamp', 'DESC')
      .take(limit);

    if (tenantId !== undefined) {
      query.andWhere('log.tenant_id = :tenantId', { tenantId });
    }

    const logs = await query.getMany();
    this.logger.log(`Found ${logs.length} recent activities`);

    return logs;
  }
}
