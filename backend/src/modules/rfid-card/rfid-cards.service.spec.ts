import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidCardService } from './rfid-cards.service';
import { RfidCard } from './rfid-card.entity';
import { RfidReader } from '../rfid-reader/rfid-reader.entity';
import { Staff } from '../staff/staff.entity';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Tenant } from '../tenant/tenant.entity';

describe('RfidCardService', () => {
  let service: RfidCardService;
  let cardRepository: Repository<RfidCard>;
  let readerRepository: Repository<RfidReader>;
  let staffRepository: Repository<Staff>;
  let vehicleRepository: Repository<Vehicle>;
  let tenantRepository: Repository<Tenant>;

  const mockCardRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockReaderRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockStaffRepository = {
    findOne: jest.fn(),
  };

  const mockVehicleRepository = {
    findOne: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidCardService,
        {
          provide: getRepositoryToken(RfidCard),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(RfidReader),
          useValue: mockReaderRepository,
        },
        {
          provide: getRepositoryToken(Staff),
          useValue: mockStaffRepository,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
      ],
    }).compile();

    service = module.get<RfidCardService>(RfidCardService);
    cardRepository = module.get<Repository<RfidCard>>(
      getRepositoryToken(RfidCard),
    );
    readerRepository = module.get<Repository<RfidReader>>(
      getRepositoryToken(RfidReader),
    );
    staffRepository = module.get<Repository<Staff>>(getRepositoryToken(Staff));
    vehicleRepository = module.get<Repository<Vehicle>>(
      getRepositoryToken(Vehicle),
    );
    tenantRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCards', () => {
    const mockCards = [
      {
        id: 1,
        card_uid: 'CARD001',
        tenant_id: 1,
        staff_id: 1,
        vehicle_id: null,
        is_active: true,
      },
      {
        id: 2,
        card_uid: 'CARD002',
        tenant_id: 1,
        staff_id: null,
        vehicle_id: 1,
        is_active: true,
      },
    ];

    it('should return all cards when no filters are provided', async () => {
      mockCardRepository.getMany.mockResolvedValue(mockCards);

      const result = await service.getCards();

      expect(mockCardRepository.createQueryBuilder).toHaveBeenCalledWith(
        'card',
      );
      expect(mockCardRepository.leftJoinAndSelect).toHaveBeenCalledTimes(3);
      expect(mockCardRepository.where).not.toHaveBeenCalled();
      expect(mockCardRepository.andWhere).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].uid).toBe('CARD001');
    });

    it('should filter cards by tenant ID', async () => {
      mockCardRepository.getMany.mockResolvedValue([mockCards[0]]);

      const result = await service.getCards(1);

      expect(mockCardRepository.where).toHaveBeenCalledWith(
        'card.tenant_id = :tenantId',
        { tenantId: 1 },
      );
      expect(result).toHaveLength(1);
      expect(result[0].uid).toBe('CARD001');
    });

    it('should filter cards by active status', async () => {
      mockCardRepository.getMany.mockResolvedValue([mockCards[0]]);

      const result = await service.getCards(undefined, true);

      expect(mockCardRepository.andWhere).toHaveBeenCalledWith(
        'card.is_active = :active',
        { active: true },
      );
      expect(result).toHaveLength(1);
    });
  });
});
