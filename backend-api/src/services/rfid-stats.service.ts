import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidLog } from '../entities/rfid-log.entity';
import { parseTimezoneString } from '../utils/timezone';

@Injectable()
export class RfidStatsService {
  private readonly logger = new Logger(RfidStatsService.name);

  constructor(
    @InjectRepository(RfidLog)
    private logRepository: Repository<RfidLog>
  ) {}

  async getStats({
    tenantId,
    dateFrom,
    dateTo,
    timezone = 'UTC'
  }: {
    tenantId?: number;
    dateFrom?: string;
    dateTo?: string;
    timezone?: string;
  }) {
    this.logger.log(`Getting stats with params: ${JSON.stringify({
      tenantId,
      dateFrom,
      dateTo,
      timezone
    }, null, 2)}`);

    const query = this.logRepository.createQueryBuilder('log')
      .leftJoin('log.card', 'card');

    // Add tenant filter if provided
    if (tenantId !== undefined) {
      query.andWhere('log.tenant_id = :tenantId', { tenantId });
    }

    // Add date range filter in UTC
    if (dateFrom && dateTo) {
      try {
        const { date: fromDate } = parseTimezoneString(dateFrom);
        const { date: toDate } = parseTimezoneString(dateTo);
        
        this.logger.log('Date range for query:', {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          originalFromDate: dateFrom,
          originalToDate: dateTo,
          timezone
        });

        // Compare timestamps directly in UTC
        query.andWhere('log.timestamp BETWEEN :dateFrom AND :dateTo', {
          dateFrom: fromDate,
          dateTo: toDate
        });

        // Log the generated query
        const rawSql = query.getQuery();
        const params = query.getParameters();
        this.logger.log('Generated SQL:', { sql: rawSql, params });

      } catch (error) {
        this.logger.error('Error parsing dates:', error);
        throw error;
      }
    }

    try {
      // Get total logs for the period
      const rawSql = query.getQuery();
      const params = query.getParameters();
      this.logger.log('Executing total count query:', { sql: rawSql, params });
      
      const totalToday = await query.getCount();
      this.logger.log(`Total logs found: ${totalToday}`);

      // Get successful logs
      const successfulToday = await query
        .clone()
        .andWhere('log.is_authorized = :authorized', { authorized: true })
        .getCount();
      this.logger.log(`Successful logs found: ${successfulToday}`);

      // Get failed logs
      const failedToday = await query
        .clone()
        .andWhere('log.is_authorized = :authorized', { authorized: false })
        .getCount();
      this.logger.log(`Failed logs found: ${failedToday}`);

      // Get unique users (cards) for the period
      const uniqueUsers = await query
        .clone()
        .select('COUNT(DISTINCT log.card_uid)', 'count')
        .getRawOne();
      this.logger.log(`Unique users found: ${uniqueUsers?.count || 0}`);

      const result = {
        totalToday,
        successfulToday,
        failedToday,
        uniqueUsersToday: parseInt(uniqueUsers?.count || '0', 10)
      };

      this.logger.log('Returning stats:', result);
      return result;

    } catch (error) {
      this.logger.error('Error getting stats:', error);
      throw error;
    }
  }

  async getDashboardStats({
    tenantId,
  }: {
    tenantId?: number;
  }) {
    this.logger.log('Getting dashboard stats');

    // Get counts for cards
    const cardStats = await this.logRepository
      .createQueryBuilder('log')
      .leftJoin('log.card', 'card')
      .select([
        'COUNT(DISTINCT card.id) as total',
        'COUNT(DISTINCT CASE WHEN card.is_active = true THEN card.id END) as active',
        'COUNT(DISTINCT CASE WHEN card.is_active = false THEN card.id END) as inactive',
        'COUNT(DISTINCT CASE WHEN card.card_type = :vehicleType THEN card.id END) as vehicles'
      ])
      .setParameter('vehicleType', 'vehicle')
      .where(tenantId ? 'log.tenant_id = :tenantId' : '1=1', { tenantId })
      .getRawOne();

    // Get reader stats
    const readerStats = await this.logRepository
      .createQueryBuilder('log')
      .leftJoin('log.reader', 'reader')
      .select([
        'COUNT(DISTINCT reader.id) as total',
        'COUNT(DISTINCT CASE WHEN reader.is_online = true THEN reader.id END) as online',
        'COUNT(DISTINCT CASE WHEN reader.is_online = false THEN reader.id END) as offline'
      ])
      .where(tenantId ? 'log.tenant_id = :tenantId' : '1=1', { tenantId })
      .getRawOne();

    // Get scan stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hourAgo = new Date(Date.now() - 3600000);

    const scanStats = await this.logRepository
      .createQueryBuilder('log')
      .select([
        'COUNT(CASE WHEN log.timestamp >= :today THEN 1 END) as today',
        'COUNT(CASE WHEN log.timestamp >= :hourAgo THEN 1 END) as lastHour'
      ])
      .where(tenantId ? 'log.tenant_id = :tenantId' : '1=1', { tenantId })
      .setParameters({
        today: today,
        hourAgo: hourAgo
      })
      .getRawOne();

    this.logger.debug('Stats results:', { cardStats, readerStats, scanStats });

    return {
      cards: {
        total: parseInt(cardStats?.total) || 0,
        active: parseInt(cardStats?.active) || 0,
        inactive: parseInt(cardStats?.inactive) || 0,
        vehicles: parseInt(cardStats?.vehicles) || 0,
      },
      readers: {
        total: parseInt(readerStats?.total) || 0,
        online: parseInt(readerStats?.online) || 0,
        offline: parseInt(readerStats?.offline) || 0,
      },
      scans: {
        today: parseInt(scanStats?.today) || 0,
        lastHour: parseInt(scanStats?.lastHour) || 0,
      },
    };
  }
}
