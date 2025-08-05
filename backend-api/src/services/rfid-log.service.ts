import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Brackets } from 'typeorm';
import { RfidLog } from '../entities/rfid-log.entity';
import { parseTimezoneString } from '../utils/timezone';

@Injectable()
export class RfidLogService {
  constructor(
    @InjectRepository(RfidLog)
    private logRepo: Repository<RfidLog>,
  ) {}

  async createLog(log: Partial<RfidLog>) {
    return this.logRepo.save(log);
  }

  async getLogs({
    tenantId,
    limit = 50,
    offset = 0,
    cardUid,
    readerId,
    cardType,
    accessGranted,
    dateFrom,
    dateTo,
    search,
    timezone = 'UTC'
  }: {
    tenantId?: number;
    limit?: number;
    offset?: number;
    cardUid?: string;
    readerId?: string;
    cardType?: string;
    accessGranted?: boolean;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    timezone?: string;
  }) {
    const query = this.logRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.card', 'card')
      .leftJoinAndSelect('card.staff', 'staff')
      .leftJoinAndSelect('card.vehicle', 'vehicle')
      .leftJoinAndSelect('log.reader', 'reader')
      .leftJoinAndSelect('log.tenant', 'tenant');

    // Apply filters
    if (tenantId !== undefined) {
      query.andWhere('log.tenant_id = :tenantId', { tenantId });
    }

    if (cardUid) {
      query.andWhere('log.card_uid = :cardUid', { cardUid });
    }

    if (readerId) {
      query.andWhere('log.reader_id = :readerId', { readerId });
    }

    if (cardType) {
      query.andWhere('card.card_type = :cardType', { cardType });
    }

    if (accessGranted !== undefined) {
      query.andWhere('log.is_authorized = :accessGranted', { accessGranted });
    }

    if (dateFrom && dateTo) {
      const { date: fromDate } = parseTimezoneString(dateFrom);
      const { date: toDate } = parseTimezoneString(dateTo);
      
      console.log('Querying logs between:', {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        originalFromDate: dateFrom,
        originalToDate: dateTo,
        timezone
      });

      query.andWhere('log.timestamp BETWEEN :dateFrom AND :dateTo', {
        dateFrom: fromDate,
        dateTo: toDate
      });
    }

    if (search) {
      query.andWhere(new Brackets(qb => {
        qb.where('log.card_uid LIKE :search', { search: `%${search}%` })
          .orWhere('COALESCE(staff.first_name, \'\') LIKE :search', { search: `%${search}%` })
          .orWhere('COALESCE(staff.last_name, \'\') LIKE :search', { search: `%${search}%` })
          .orWhere('COALESCE(vehicle.license_plate, \'\') LIKE :search', { search: `%${search}%` })
          .orWhere('COALESCE(reader.name, \'\') LIKE :search', { search: `%${search}%` })
          .orWhere('log.reader_id LIKE :search', { search: `%${search}%` });
      }));
    }

    // Add pagination and ordering
    query.skip(offset)
         .take(limit)
         .orderBy('log.timestamp', 'DESC');

    // Get total count
    const [logs, total] = await query.getManyAndCount();

    return {
      data: logs,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getStatsByDateRange(startDate: string, endDate: string, tenantId?: number) {
    const query = this.logRepo
      .createQueryBuilder('log')
      .select("DATE(log.timestamp)", "date")
      .addSelect("COUNT(log.id)", "count")
      .where("log.timestamp BETWEEN :start AND :end", {
        start: new Date(startDate),
        end: new Date(endDate),
      })
      .groupBy("DATE(log.timestamp)")
      .orderBy("DATE(log.timestamp)", "ASC");

    if (tenantId) query.andWhere("log.tenant_id = :tenantId", { tenantId });

    return query.getRawMany();
  }
}
