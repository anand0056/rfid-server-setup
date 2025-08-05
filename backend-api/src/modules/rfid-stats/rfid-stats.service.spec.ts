import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidStatsService } from './rfid-stats.service';
import { RfidLog } from '../rfid-log/rfid-log.entity';

describe('RfidStatsService', () => {
  let service: RfidStatsService;
  let logRepository: Repository<RfidLog>;

  const mockLogRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidStatsService,
        {
          provide: getRepositoryToken(RfidLog),
          useValue: mockLogRepository,
        },
      ],
    }).compile();

    service = module.get<RfidStatsService>(RfidStatsService);
    logRepository = module.get<Repository<RfidLog>>(
      getRepositoryToken(RfidLog),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    const mockStats = {
      totalScans: 100,
      uniqueCards: 20,
      uniqueReaders: 5,
      accessDenied: 10,
      hourlyStats: [
        { hour: '00', count: 5 },
        { hour: '01', count: 3 },
      ],
      dailyStats: [
        { date: '2023-01-01', count: 50 },
        { date: '2023-01-02', count: 50 },
      ],
    };

    it('should return stats without filters', async () => {
      mockLogRepository.getCount.mockResolvedValue(100);
      mockLogRepository.getRawMany
        .mockResolvedValueOnce([{ count: 20 }]) // uniqueCards
        .mockResolvedValueOnce([{ count: 5 }]) // uniqueReaders
        .mockResolvedValueOnce([{ count: 10 }]) // accessDenied
        .mockResolvedValueOnce(mockStats.hourlyStats)
        .mockResolvedValueOnce(mockStats.dailyStats);

      const result = await service.getStats({});

      expect(mockLogRepository.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(result).toMatchObject({
        totalScans: 100,
        uniqueCards: 20,
        uniqueReaders: 5,
        accessDenied: 10,
        hourlyStats: mockStats.hourlyStats,
        dailyStats: mockStats.dailyStats,
      });
    });

    it('should apply tenant filter when provided', async () => {
      mockLogRepository.getCount.mockResolvedValue(50);
      mockLogRepository.getRawMany
        .mockResolvedValueOnce([{ count: 10 }])
        .mockResolvedValueOnce([{ count: 3 }])
        .mockResolvedValueOnce([{ count: 5 }])
        .mockResolvedValueOnce(mockStats.hourlyStats)
        .mockResolvedValueOnce(mockStats.dailyStats);

      await service.getStats({ tenantId: 1 });

      expect(mockLogRepository.andWhere).toHaveBeenCalledWith(
        'log.tenant_id = :tenantId',
        { tenantId: 1 },
      );
    });

    it('should apply date range filter when provided', async () => {
      const dateFrom = '2023-01-01T00:00:00Z';
      const dateTo = '2023-01-31T23:59:59Z';

      mockLogRepository.getCount.mockResolvedValue(30);
      mockLogRepository.getRawMany
        .mockResolvedValueOnce([{ count: 8 }])
        .mockResolvedValueOnce([{ count: 2 }])
        .mockResolvedValueOnce([{ count: 3 }])
        .mockResolvedValueOnce(mockStats.hourlyStats)
        .mockResolvedValueOnce(mockStats.dailyStats);

      await service.getStats({ dateFrom, dateTo });

      expect(mockLogRepository.andWhere).toHaveBeenCalledWith(
        'log.timestamp BETWEEN :fromDate AND :toDate',
        expect.any(Object),
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats for a tenant', async () => {
      mockLogRepository.getCount
        .mockResolvedValueOnce(100) // totalScans
        .mockResolvedValueOnce(20) // todayScans
        .mockResolvedValueOnce(5); // lastHourScans

      const result = await service.getDashboardStats({ tenantId: 1 });

      expect(mockLogRepository.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(result).toMatchObject({
        totalScans: 100,
        todayScans: 20,
        lastHourScans: 5,
      });
    });
  });
});
