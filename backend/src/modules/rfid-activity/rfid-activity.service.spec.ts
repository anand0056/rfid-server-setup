import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidActivityService } from './rfid-activity.service';
import { RfidLog } from '../rfid-log/rfid-log.entity';

describe('RfidActivityService', () => {
  let service: RfidActivityService;
  let repository: Repository<RfidLog>;

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidActivityService,
        {
          provide: getRepositoryToken(RfidLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RfidActivityService>(RfidActivityService);
    repository = module.get<Repository<RfidLog>>(getRepositoryToken(RfidLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecentActivity', () => {
    const mockLogs = [
      {
        id: 1,
        tenant_id: 1,
        card_id: 1,
        reader_id: 1,
        timestamp: new Date(),
        card: {
          id: 1,
          card_uid: 'CARD001',
          staff: { name: 'John Doe' },
        },
        reader: {
          id: 1,
          name: 'Main Entrance',
        },
      },
      {
        id: 2,
        tenant_id: 1,
        card_id: 2,
        reader_id: 2,
        timestamp: new Date(),
        card: {
          id: 2,
          card_uid: 'CARD002',
          vehicle: { license_plate: 'ABC123' },
        },
        reader: {
          id: 2,
          name: 'Parking Gate',
        },
      },
    ];

    it('should return recent activities with default limit', async () => {
      mockRepository.getMany.mockResolvedValue(mockLogs);

      const result = await service.getRecentActivity();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'log.card',
        'card',
      );
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'card.staff',
        'staff',
      );
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'card.vehicle',
        'vehicle',
      );
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'log.reader',
        'reader',
      );
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'log.tenant',
        'tenant',
      );
      expect(mockRepository.orderBy).toHaveBeenCalledWith(
        'log.timestamp',
        'DESC',
      );
      expect(mockRepository.take).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockLogs);
    });

    it('should filter by tenant ID', async () => {
      mockRepository.getMany.mockResolvedValue([mockLogs[0]]);

      await service.getRecentActivity(1);

      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'log.tenant_id = :tenantId',
        { tenantId: 1 },
      );
    });

    it('should apply custom limit', async () => {
      mockRepository.getMany.mockResolvedValue([mockLogs[0]]);

      await service.getRecentActivity(undefined, 10);

      expect(mockRepository.take).toHaveBeenCalledWith(10);
    });
  });
});
