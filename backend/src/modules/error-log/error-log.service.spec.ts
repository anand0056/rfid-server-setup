import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLogService } from './error-log.service';
import { ErrorLog, ErrorType } from './error-log.entity';

describe('ErrorLogService', () => {
  let service: ErrorLogService;
  let repository: Repository<ErrorLog>;

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorLogService,
        {
          provide: getRepositoryToken(ErrorLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ErrorLogService>(ErrorLogService);
    repository = module.get<Repository<ErrorLog>>(getRepositoryToken(ErrorLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockErrorLogs = [
      {
        id: 1,
        error_type: ErrorType.MQTT_PARSE_ERROR,
        message: 'Hardware failure',
        resolved: false,
      },
      {
        id: 2,
        error_type: ErrorType.DATABASE_ERROR,
        message: 'Software error',
        resolved: true,
      },
    ];

    it('should return all error logs with default pagination', async () => {
      mockRepository.getMany.mockResolvedValue(mockErrorLogs);

      const result = await service.findAll();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'error_log',
      );
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'error_log.tenant',
        'tenant',
      );
      expect(mockRepository.take).toHaveBeenCalledWith(50);
      expect(mockRepository.skip).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockErrorLogs);
    });

    it('should filter by tenant ID', async () => {
      mockRepository.getMany.mockResolvedValue([mockErrorLogs[0]]);

      await service.findAll({ tenantId: 1 });

      expect(mockRepository.where).toHaveBeenCalledWith(
        'error_log.tenantId = :tenantId',
        { tenantId: 1 },
      );
    });

    it('should filter by error type', async () => {
      mockRepository.getMany.mockResolvedValue([mockErrorLogs[0]]);

      await service.findAll({ errorType: ErrorType.MQTT_PARSE_ERROR });

      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'error_log.error_type = :errorType',
        { errorType: ErrorType.MQTT_PARSE_ERROR },
      );
    });

    it('should filter by resolution status', async () => {
      mockRepository.getMany.mockResolvedValue([mockErrorLogs[1]]);

      await service.findAll({ resolved: true });

      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'error_log.resolved = :resolved',
        { resolved: true },
      );
    });

    it('should apply custom pagination', async () => {
      mockRepository.getMany.mockResolvedValue(mockErrorLogs);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockRepository.take).toHaveBeenCalledWith(10);
      expect(mockRepository.skip).toHaveBeenCalledWith(10);
    });
  });
});
