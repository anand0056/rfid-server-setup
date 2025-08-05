import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidCardService } from './rfid-cards.service';
import { RfidCard } from '../entities/rfid-card.entity';
import { RfidReader } from '../entities/rfid-reader.entity';
import { Staff } from '../entities/staff.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Tenant } from '../entities/tenant.entity';

describe('RfidCardService', () => {
  let service: RfidCardService;
  let cardRepository: Repository<RfidCard>;
  let readerRepository: Repository<RfidReader>;
  let staffRepository: Repository<Staff>;
  let vehicleRepository: Repository<Vehicle>;
  let tenantRepository: Repository<Tenant>;

  // Mock data
  const mockTenant = {
    id: 1,
    name: 'Test Tenant',
    code: 'TEST001',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockStaff = {
    id: 1,
    tenant_id: 1,
    name: 'John Doe',
    employee_id: 'EMP001',
    department: 'IT',
    position: 'Developer',
    email: 'john@test.com',
    phone: '+1234567890',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockVehicle = {
    id: 1,
    tenant_id: 1,
    license_plate: 'ABC123',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Blue',
    vehicle_type: 'sedan',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCard = {
    id: 1,
    tenant_id: 1,
    card_uid: 'CARD001',
    card_number: '1234567890',
    staff_id: 1,
    vehicle_id: null,
    is_active: true,
    issued_at: new Date(),
    expires_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    staff: mockStaff,
    vehicle: null,
  };

  const mockReader = {
    id: 1,
    tenant_id: 1,
    reader_id: 'READER001',
    name: 'Main Entrance',
    location: 'Building A',
    ip_address: '192.168.1.100',
    mac_address: '00:11:22:33:44:55',
    is_online: true,
    last_heartbeat: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockQueryBuilder = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidCardService,
        {
          provide: getRepositoryToken(RfidCard),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RfidReader),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Staff),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RfidCardService>(RfidCardService);
    cardRepository = module.get<Repository<RfidCard>>(getRepositoryToken(RfidCard));
    readerRepository = module.get<Repository<RfidReader>>(getRepositoryToken(RfidReader));
    staffRepository = module.get<Repository<Staff>>(getRepositoryToken(Staff));
    vehicleRepository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenantOverview', () => {
    it('should return complete tenant overview', async () => {
      const tenantId = 1;
      
      // Mock all the individual method calls
      jest.spyOn(service, 'getTenantCards').mockResolvedValue([mockCard as any]);
      jest.spyOn(service, 'getTenantReaders').mockResolvedValue([mockReader as any]);
      jest.spyOn(service, 'getTenantStaff').mockResolvedValue([mockStaff as any]);
      jest.spyOn(service, 'getTenantVehicles').mockResolvedValue([mockVehicle as any]);
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(mockTenant as any);

      const result = await service.getTenantOverview(tenantId);

      expect(result).toEqual({
        tenant: mockTenant,
        cards: [mockCard],
        readers: [mockReader],
        staff: [mockStaff],
        vehicles: [mockVehicle],
        summary: {
          totalCards: 1,
          staffCards: 1,
          vehicleCards: 0,
          totalReaders: 1,
          activeReaders: 1,
          totalStaff: 1,
          totalVehicles: 1,
        },
      });
    });

    it('should handle errors properly', async () => {
      const tenantId = 1;
      jest.spyOn(service, 'getTenantCards').mockRejectedValue(new Error('Database error'));

      await expect(service.getTenantOverview(tenantId)).rejects.toThrow('Failed to get tenant overview: Database error');
    });
  });

  describe('getTenantCards', () => {
    it('should return cards for a tenant', async () => {
      const tenantId = 1;
      mockQueryBuilder.getMany.mockResolvedValue([mockCard]);

      const result = await service.getTenantCards(tenantId);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledWith('card');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('card.staff', 'staff');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('card.vehicle', 'vehicle');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card.tenant_id = :tenantId', { tenantId });
      expect(result).toEqual([mockCard]);
    });
  });

  describe('getTenantReaders', () => {
    it('should return readers for a tenant', async () => {
      const tenantId = 1;
      mockQueryBuilder.getMany.mockResolvedValue([mockReader]);

      const result = await service.getTenantReaders(tenantId);

      expect(readerRepository.createQueryBuilder).toHaveBeenCalledWith('reader');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('reader.tenant_id = :tenantId', { tenantId });
      expect(result).toEqual([mockReader]);
    });
  });

  describe('getTenantStaff', () => {
    it('should return staff for a tenant', async () => {
      const tenantId = 1;
      mockQueryBuilder.getMany.mockResolvedValue([mockStaff]);

      const result = await service.getTenantStaff(tenantId);

      expect(staffRepository.createQueryBuilder).toHaveBeenCalledWith('staff');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('staff.rfidCards', 'cards');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('staff.tenant_id = :tenantId', { tenantId });
      expect(result).toEqual([mockStaff]);
    });
  });

  describe('getTenantVehicles', () => {
    it('should return vehicles for a tenant', async () => {
      const tenantId = 1;
      mockQueryBuilder.getMany.mockResolvedValue([mockVehicle]);

      const result = await service.getTenantVehicles(tenantId);

      expect(vehicleRepository.createQueryBuilder).toHaveBeenCalledWith('vehicle');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('vehicle.rfidCards', 'cards');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('vehicle.tenant_id = :tenantId', { tenantId });
      expect(result).toEqual([mockVehicle]);
    });
  });

  describe('getCardsByType', () => {
    it('should return staff cards when type is staff', async () => {
      const tenantId = 1;
      const type = 'staff';
      mockQueryBuilder.getMany.mockResolvedValue([mockCard]);

      const result = await service.getCardsByType(tenantId, type);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledWith('card');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card.tenant_id = :tenantId', { tenantId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('card.staff_id IS NOT NULL');
      expect(result).toEqual([mockCard]);
    });

    it('should return vehicle cards when type is vehicle', async () => {
      const tenantId = 1;
      const type = 'vehicle';
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getCardsByType(tenantId, type);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('card.vehicle_id IS NOT NULL');
      expect(result).toEqual([]);
    });
  });

  describe('getUnassignedCards', () => {
    it('should return unassigned cards', async () => {
      const tenantId = 1;
      const unassignedCard = { ...mockCard, staff_id: null, vehicle_id: null };
      mockQueryBuilder.getMany.mockResolvedValue([unassignedCard]);

      const result = await service.getUnassignedCards(tenantId);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledWith('card');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card.tenant_id = :tenantId', { tenantId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('card.staff_id IS NULL');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('card.vehicle_id IS NULL');
      expect(result).toEqual([unassignedCard]);
    });
  });

  describe('getReaderWithCards', () => {
    it('should return reader with associated cards', async () => {
      const readerId = 1;
      const tenantId = 1;
      const readerWithCards = { ...mockReader, rfidCards: [mockCard] };
      mockQueryBuilder.getOne.mockResolvedValue(readerWithCards);

      const result = await service.getReaderWithCards(readerId, tenantId);

      expect(readerRepository.createQueryBuilder).toHaveBeenCalledWith('reader');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('reader.rfidCards', 'cards');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('reader.id = :readerId', { readerId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('reader.tenant_id = :tenantId', { tenantId });
      expect(result).toEqual(readerWithCards);
    });

    it('should work without tenant filter', async () => {
      const readerId = 1;
      const readerWithCards = { ...mockReader, rfidCards: [mockCard] };
      mockQueryBuilder.getOne.mockResolvedValue(readerWithCards);

      const result = await service.getReaderWithCards(readerId);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('reader.tenant_id = :tenantId', expect.any(Object));
      expect(result).toEqual(readerWithCards);
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      const tenantId = 1;
      
      jest.spyOn(cardRepository, 'count')
        .mockResolvedValueOnce(10) // total cards
        .mockResolvedValueOnce(8)  // active cards
        .mockResolvedValueOnce(6)  // staff cards
        .mockResolvedValueOnce(4); // vehicle cards

      jest.spyOn(readerRepository, 'count')
        .mockResolvedValueOnce(5)  // total readers
        .mockResolvedValueOnce(4); // active readers

      const result = await service.getTenantStats(tenantId);

      expect(result).toEqual({
        cards: {
          total: 10,
          active: 8,
          staff: 6,
          vehicle: 4,
          inactive: 2,
        },
        readers: {
          total: 5,
          active: 4,
          inactive: 1,
        },
      });
    });
  });

  describe('getCards', () => {
    it('should return cards with filters', async () => {
      const tenantId = 1;
      const activeOnly = true;
      const expectedCards = [
        {
          ...mockCard,
          uid: mockCard.card_uid,
          assigned_staff_id: mockCard.staff_id,
          assigned_vehicle_id: mockCard.vehicle_id,
        },
      ];
      
      mockQueryBuilder.getMany.mockResolvedValue([mockCard]);

      const result = await service.getCards(tenantId, activeOnly);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledWith('card');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card.tenant_id = :tenantId', { tenantId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('card.is_active = :active', { active: true });
      expect(result).toEqual(expectedCards);
    });

    it('should work without filters', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockCard]);

      const result = await service.getCards();

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledWith('card');
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('getCardByUid', () => {
    it('should return card by UID', async () => {
      const uid = 'CARD001';
      const tenantId = 1;
      mockQueryBuilder.getOne.mockResolvedValue(mockCard);

      const result = await service.getCardByUid(uid, tenantId);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledWith('card');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card.card_uid = :uid', { uid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('card.tenant_id = :tenantId', { tenantId });
      expect(result).toEqual({
        ...mockCard,
        uid: mockCard.card_uid,
        assigned_staff_id: mockCard.staff_id,
        assigned_vehicle_id: mockCard.vehicle_id,
      });
    });

    it('should return null when card not found', async () => {
      const uid = 'NONEXISTENT';
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getCardByUid(uid);

      expect(result).toBeNull();
    });
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const cardData = {
        tenant_id: 1,
        card_uid: 'NEWCARD001',
        card_number: '0987654321',
        staff_id: 1,
      };

      jest.spyOn(cardRepository, 'create').mockReturnValue(cardData as any);
      jest.spyOn(cardRepository, 'save').mockResolvedValue({ ...cardData, id: 2 } as any);

      const result = await service.createCard(cardData);

      expect(cardRepository.create).toHaveBeenCalledWith(cardData);
      expect(cardRepository.save).toHaveBeenCalledWith(cardData);
      expect(result).toEqual({ ...cardData, id: 2 });
    });
  });

  describe('updateCard', () => {
    it('should update a card', async () => {
      const uid = 'CARD001';
      const tenantId = 1;
      const updateData: Partial<RfidCard> = { card_number: '1111111111' } as any;
      
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      jest.spyOn(service, 'getCardByUid').mockResolvedValue(mockCard as any);

      const result = await service.updateCard(uid, updateData, tenantId);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(RfidCard);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card_uid = :uid', { uid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tenant_id = :tenantId', { tenantId });
      expect(result).toEqual(mockCard);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      const uid = 'CARD001';
      const tenantId = 1;
      
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });

      const result = await service.deleteCard(uid, tenantId);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(RfidCard);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('card_uid = :uid', { uid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tenant_id = :tenantId', { tenantId });
      expect(result).toEqual({
        deleted: true,
        affected: 1,
      });
    });

    it('should return false when no card deleted', async () => {
      const uid = 'NONEXISTENT';
      
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      const result = await service.deleteCard(uid);

      expect(result).toEqual({
        deleted: false,
        affected: 0,
      });
    });
  });
});
