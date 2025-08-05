import { Test, TestingModule } from '@nestjs/testing';
import { RfidCardController } from './rfid-card.controllers';
import { RfidCardService } from '../services/rfid-cards.service';

describe('RfidCardController', () => {
  let controller: RfidCardController;
  let service: RfidCardService;

  // Mock data with proper typing
  const mockTenant = {
    id: 1,
    name: 'Test Tenant',
    code: 'TEST001',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

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
  } as any;

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
  } as any;

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
    uid: 'CARD001',
    assigned_staff_id: 1,
    assigned_vehicle_id: null,
    card_type: 'staff',
    description: 'Test card',
    tenant: mockTenant,
  } as any;

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
    reader_group_id: null,
    configuration: null,
    tenant: mockTenant,
    reader_group: null,
  } as any;

  const mockTenantOverview = {
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
  };

  const mockStats = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RfidCardController],
      providers: [
        {
          provide: RfidCardService,
          useValue: {
            getCards: jest.fn(),
            getTenantOverview: jest.fn(),
            getCardsByType: jest.fn(),
            getUnassignedCards: jest.fn(),
            getTenantStats: jest.fn(),
            getReaderWithCards: jest.fn(),
            getCardByUid: jest.fn(),
            createCard: jest.fn(),
            updateCard: jest.fn(),
            deleteCard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RfidCardController>(RfidCardController);
    service = module.get<RfidCardService>(RfidCardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCards', () => {
    it('should return cards with tenant filter', async () => {
      const tenantId = '1';
      const active = 'true';
      
      jest.spyOn(service, 'getCards').mockResolvedValue([mockCard] as any);

      const result = await controller.getCards(tenantId, active);

      expect(service.getCards).toHaveBeenCalledWith(1, true);
      expect(result).toEqual([mockCard]);
    });

    it('should return cards without filters', async () => {
      jest.spyOn(service, 'getCards').mockResolvedValue([mockCard]);

      const result = await controller.getCards();

      expect(service.getCards).toHaveBeenCalledWith(undefined, false);
      expect(result).toEqual([mockCard]);
    });

    it('should handle active filter as false', async () => {
      const tenantId = '1';
      const active = 'false';
      
      jest.spyOn(service, 'getCards').mockResolvedValue([mockCard]);

      const result = await controller.getCards(tenantId, active);

      expect(service.getCards).toHaveBeenCalledWith(1, false);
      expect(result).toEqual([mockCard]);
    });
  });

  describe('getTenantOverview', () => {
    it('should return comprehensive tenant overview', async () => {
      const tenantId = '1';
      
      jest.spyOn(service, 'getTenantOverview').mockResolvedValue(mockTenantOverview);

      const result = await controller.getTenantOverview(tenantId);

      expect(service.getTenantOverview).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTenantOverview);
    });

    it('should handle service errors', async () => {
      const tenantId = '1';
      const error = new Error('Service error');
      
      jest.spyOn(service, 'getTenantOverview').mockRejectedValue(error);

      await expect(controller.getTenantOverview(tenantId)).rejects.toThrow('Service error');
    });
  });

  describe('getCardsByType', () => {
    it('should return staff cards', async () => {
      const tenantId = '1';
      const type = 'staff';
      
      jest.spyOn(service, 'getCardsByType').mockResolvedValue([mockCard]);

      const result = await controller.getCardsByType(tenantId, type);

      expect(service.getCardsByType).toHaveBeenCalledWith(1, 'staff');
      expect(result).toEqual([mockCard]);
    });

    it('should return vehicle cards', async () => {
      const tenantId = '1';
      const type = 'vehicle';
      const vehicleCard = { ...mockCard, staff_id: null, vehicle_id: 1, assigned_staff_id: null, assigned_vehicle_id: 1 };
      
      jest.spyOn(service, 'getCardsByType').mockResolvedValue([vehicleCard]);

      const result = await controller.getCardsByType(tenantId, type);

      expect(service.getCardsByType).toHaveBeenCalledWith(1, 'vehicle');
      expect(result).toEqual([vehicleCard]);
    });
  });

  describe('getUnassignedCards', () => {
    it('should return unassigned cards', async () => {
      const tenantId = '1';
      const unassignedCard = { 
        ...mockCard, 
        staff_id: null, 
        vehicle_id: null, 
        assigned_staff_id: null, 
        assigned_vehicle_id: null 
      };
      
      jest.spyOn(service, 'getUnassignedCards').mockResolvedValue([unassignedCard]);

      const result = await controller.getUnassignedCards(tenantId);

      expect(service.getUnassignedCards).toHaveBeenCalledWith(1);
      expect(result).toEqual([unassignedCard]);
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      const tenantId = '1';
      
      jest.spyOn(service, 'getTenantStats').mockResolvedValue(mockStats);

      const result = await controller.getTenantStats(tenantId);

      expect(service.getTenantStats).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getReaderWithCards', () => {
    it('should return reader with cards and tenant filter', async () => {
      const readerId = '1';
      const tenantId = '1';
      const readerWithCards = { ...mockReader, rfidCards: [mockCard] };
      
      jest.spyOn(service, 'getReaderWithCards').mockResolvedValue(readerWithCards);

      const result = await controller.getReaderWithCards(readerId, tenantId);

      expect(service.getReaderWithCards).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(readerWithCards);
    });

    it('should return reader with cards without tenant filter', async () => {
      const readerId = '1';
      const readerWithCards = { ...mockReader, rfidCards: [mockCard] };
      
      jest.spyOn(service, 'getReaderWithCards').mockResolvedValue(readerWithCards);

      const result = await controller.getReaderWithCards(readerId);

      expect(service.getReaderWithCards).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(readerWithCards);
    });
  });

  describe('getCard', () => {
    it('should return card by UID with tenant filter', async () => {
      const uid = 'CARD001';
      const tenantId = '1';
      
      jest.spyOn(service, 'getCardByUid').mockResolvedValue(mockCard);

      const result = await controller.getCard(uid, tenantId);

      expect(service.getCardByUid).toHaveBeenCalledWith('CARD001', 1);
      expect(result).toEqual(mockCard);
    });

    it('should return card by UID without tenant filter', async () => {
      const uid = 'CARD001';
      
      jest.spyOn(service, 'getCardByUid').mockResolvedValue(mockCard);

      const result = await controller.getCard(uid);

      expect(service.getCardByUid).toHaveBeenCalledWith('CARD001', undefined);
      expect(result).toEqual(mockCard);
    });

    it('should return null when card not found', async () => {
      const uid = 'NONEXISTENT';
      
      jest.spyOn(service, 'getCardByUid').mockResolvedValue(null);

      const result = await controller.getCard(uid);

      expect(result).toBeNull();
    });
  });

  describe('createCard', () => {
    it('should create a new card with mapped data', async () => {
      const inputData = {
        uid: 'NEWCARD001',
        assigned_staff_id: 1,
        assigned_vehicle_id: null,
        tenant_id: 1,
        card_number: '0987654321',
        is_active: true,
      };

      const expectedMappedData = {
        card_uid: 'NEWCARD001',
        staff_id: 1,
        vehicle_id: null,
        tenant_id: 1,
        card_number: '0987654321',
        is_active: true,
      };

      const createdCard = { ...expectedMappedData, id: 2 };
      
      jest.spyOn(service, 'createCard').mockResolvedValue(createdCard as any);

      const result = await controller.createCard(inputData);

      expect(service.createCard).toHaveBeenCalledWith(expectedMappedData);
      expect(result).toEqual(createdCard);
    });

    it('should handle card creation with vehicle assignment', async () => {
      const inputData = {
        uid: 'VEHICLECARD001',
        assigned_staff_id: null,
        assigned_vehicle_id: 1,
        tenant_id: 1,
        card_number: '1111222233',
        is_active: true,
      };

      const expectedMappedData = {
        card_uid: 'VEHICLECARD001',
        staff_id: null,
        vehicle_id: 1,
        tenant_id: 1,
        card_number: '1111222233',
        is_active: true,
      };

      const createdCard = { ...expectedMappedData, id: 3 };
      
      jest.spyOn(service, 'createCard').mockResolvedValue(createdCard as any);

      const result = await controller.createCard(inputData);

      expect(service.createCard).toHaveBeenCalledWith(expectedMappedData);
      expect(result).toEqual(createdCard);
    });
  });

  describe('updateCard', () => {
    it('should update card with mapped data and tenant filter', async () => {
      const uid = 'CARD001';
      const tenantId = '1';
      const inputData = {
        uid: 'CARD001_UPDATED',
        assigned_staff_id: 2,
        assigned_vehicle_id: null,
        card_number: '9999999999',
        is_active: false,
      };

      const expectedMappedData = {
        card_uid: 'CARD001_UPDATED',
        staff_id: 2,
        vehicle_id: null,
        card_number: '9999999999',
        is_active: false,
      };

      const updatedCard = { ...mockCard, ...expectedMappedData };
      
      jest.spyOn(service, 'updateCard').mockResolvedValue(updatedCard as any);

      const result = await controller.updateCard(uid, inputData, tenantId);

      expect(service.updateCard).toHaveBeenCalledWith('CARD001', expectedMappedData, 1);
      expect(result).toEqual(updatedCard);
    });

    it('should update card without tenant filter', async () => {
      const uid = 'CARD001';
      const inputData = {
        card_number: '8888888888',
      };

      const expectedMappedData = {
        card_uid: undefined,
        staff_id: undefined,
        vehicle_id: undefined,
        card_number: '8888888888',
      };

      const updatedCard = { ...mockCard, card_number: '8888888888' };
      
      jest.spyOn(service, 'updateCard').mockResolvedValue(updatedCard as any);

      const result = await controller.updateCard(uid, inputData);

      expect(service.updateCard).toHaveBeenCalledWith('CARD001', expectedMappedData, undefined);
      expect(result).toEqual(updatedCard);
    });
  });

  describe('deleteCard', () => {
    it('should delete card with tenant filter', async () => {
      const uid = 'CARD001';
      const tenantId = '1';
      const deleteResult = { deleted: true, affected: 1 };
      
      jest.spyOn(service, 'deleteCard').mockResolvedValue(deleteResult);

      const result = await controller.deleteCard(uid, tenantId);

      expect(service.deleteCard).toHaveBeenCalledWith('CARD001', 1);
      expect(result).toEqual(deleteResult);
    });

    it('should delete card without tenant filter', async () => {
      const uid = 'CARD001';
      const deleteResult = { deleted: true, affected: 1 };
      
      jest.spyOn(service, 'deleteCard').mockResolvedValue(deleteResult);

      const result = await controller.deleteCard(uid);

      expect(service.deleteCard).toHaveBeenCalledWith('CARD001', undefined);
      expect(result).toEqual(deleteResult);
    });

    it('should handle card not found during deletion', async () => {
      const uid = 'NONEXISTENT';
      const deleteResult = { deleted: false, affected: 0 };
      
      jest.spyOn(service, 'deleteCard').mockResolvedValue(deleteResult);

      const result = await controller.deleteCard(uid);

      expect(result).toEqual(deleteResult);
    });
  });
});
