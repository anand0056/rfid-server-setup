import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog, ErrorType } from '../entities/error-log.entity';

export interface ErrorLogQueryParams {
  tenantId?: number;
  errorType?: ErrorType;
  resolved?: boolean;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface ErrorLogStats {
  total: number;
  resolved: number;
  unresolved: number;
  byType: Record<ErrorType, number>;
  recentCount: number;
}

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectRepository(ErrorLog)
    private errorLogRepository: Repository<ErrorLog>,
  ) {}

  async findAll(params: ErrorLogQueryParams = {}) {
    const {
      tenantId,
      errorType,
      resolved,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = params;

    const queryBuilder = this.errorLogRepository
      .createQueryBuilder('error_log')
      .leftJoinAndSelect('error_log.tenant', 'tenant');

    if (tenantId) {
      queryBuilder.where('error_log.tenantId = :tenantId', { tenantId });
    }

    if (errorType) {
      queryBuilder.andWhere('error_log.errorType = :errorType', { errorType });
    }

    if (resolved !== undefined) {
      queryBuilder.andWhere('error_log.resolved = :resolved', { resolved });
    }

    if (startDate) {
      queryBuilder.andWhere('error_log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('error_log.createdAt <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();

    const errorLogs = await queryBuilder
      .orderBy('error_log.tenantId', 'ASC')
      .addOrderBy('error_log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: errorLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.errorLogRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });
  }

  async getStats(tenantId: number = 1): Promise<ErrorLogStats> {
    const queryBuilder = this.errorLogRepository
      .createQueryBuilder('error_log')
      .where('error_log.tenantId = :tenantId', { tenantId });

    const total = await queryBuilder.getCount();
    const resolved = await queryBuilder.clone().andWhere('error_log.resolved = true').getCount();
    const unresolved = total - resolved;

    // Get count by error type
    const typeCountsQuery = await this.errorLogRepository
      .createQueryBuilder('error_log')
      .select('error_log.errorType', 'errorType')
      .addSelect('COUNT(*)', 'count')
      .where('error_log.tenantId = :tenantId', { tenantId })
      .groupBy('error_log.errorType')
      .getRawMany();

    const byType: Record<ErrorType, number> = {
      [ErrorType.MQTT_PARSE_ERROR]: 0,
      [ErrorType.DATABASE_ERROR]: 0,
      [ErrorType.VALIDATION_ERROR]: 0,
      [ErrorType.UNKNOWN_READER]: 0,
      [ErrorType.UNKNOWN_CARD]: 0,
      [ErrorType.GENERAL_ERROR]: 0,
    };

    typeCountsQuery.forEach(row => {
      byType[row.errorType] = parseInt(row.count);
    });

    // Get recent count (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentCount = await queryBuilder
      .clone()
      .andWhere('error_log.createdAt >= :oneDayAgo', { oneDayAgo })
      .getCount();

    return {
      total,
      resolved,
      unresolved,
      byType,
      recentCount,
    };
  }

  async markAsResolved(id: number, resolvedBy: string, resolutionNotes?: string) {
    const errorLog = await this.findOne(id);
    if (!errorLog) {
      throw new Error('Error log not found');
    }

    errorLog.resolved = true;
    errorLog.resolvedBy = resolvedBy;
    errorLog.resolvedAt = new Date();
    if (resolutionNotes) {
      errorLog.resolutionNotes = resolutionNotes;
    }

    return this.errorLogRepository.save(errorLog);
  }

  async markAsUnresolved(id: number) {
    const errorLog = await this.findOne(id);
    if (!errorLog) {
      throw new Error('Error log not found');
    }

    errorLog.resolved = false;
    errorLog.resolvedBy = undefined;
    errorLog.resolvedAt = undefined;
    errorLog.resolutionNotes = undefined;

    return this.errorLogRepository.save(errorLog);
  }
}
