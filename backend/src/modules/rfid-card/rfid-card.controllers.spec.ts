import { Test, TestingModule } from '@nestjs/testing';
import { RfidCardController } from './rfid-card.controllers';
import { RfidCardService } from './rfid-cards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RfidCard } from './rfid-card.entity';
import { RfidReader } from '../rfid-reader/rfid-reader.entity';
import { Staff } from '../staff/staff.entity';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Tenant } from '../tenant/tenant.entity';

describe('RfidCardController', () => {
  let controller: RfidCardController;
  let service: RfidCardService;

  const mockRfidCardService = {
    getCards: jest.fn(),
    getTenantOverview: jest.fn(),
    getCardsByType: jest.fn(),
    getUnassignedCards: jest.fn(),
    getTenantStats: jest.fn(),
    getReaderWithCards: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RfidCardController],
      providers: [
        {
          provide: RfidCardService,
          useValue: mockRfidCardService,
        },
        {
          provide: getRepositoryToken(RfidCard),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RfidReader),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Staff),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RfidCardController>(RfidCardController);
    service = module.get<RfidCardService>(RfidCardService);
  });

  describe('getCards', () => {
    it('should return all cards when no filters provided', async () => {
      const mockCards = [
        { id: 1, card_uid: 'CARD001' },
        { id: 2, card_uid: 'CARD002' },
      ];
      mockRfidCardService.getCards.mockResolvedValue(mockCards);

      const result = await controller.getCards();

      expect(service.getCards).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockCards);
    });

    it('should filter cards by tenant ID', async () => {
      const mockCards = [{ id: 1, card_uid: 'CARD001' }];
      mockRfidCardService.getCards.mockResolvedValue(mockCards);

      const result = await controller.getCards('1');

      expect(service.getCards).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(mockCards);
    });

    it('should filter cards by active status', async () => {
      const mockCards = [{ id: 1, card_uid: 'CARD001', is_active: true }];
      mockRfidCardService.getCards.mockResolvedValue(mockCards);

      const result = await controller.getCards(undefined, 'true');

      expect(service.getCards).toHaveBeenCalledWith(undefined, true);
      expect(result).toEqual(mockCards);
    });
  });

  describe('getTenantOverview', () => {
    it('should return tenant overview', async () => {
      const mockOverview = {
        totalCards: 10,
        activeCards: 8,
        staffCards: 6,
        vehicleCards: 4,
      };
      mockRfidCardService.getTenantOverview.mockResolvedValue(mockOverview);

      const result = await controller.getTenantOverview('1');

      expect(service.getTenantOverview).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOverview);
    });
  });

  describe('getCardsByType', () => {
    it('should return staff cards', async () => {
      const mockStaffCards = [{ id: 1, card_uid: 'CARD001', type: 'staff' }];
      mockRfidCardService.getCardsByType.mockResolvedValue(mockStaffCards);

      const result = await controller.getCardsByType('1', 'staff');

      expect(service.getCardsByType).toHaveBeenCalledWith(1, 'staff');
      expect(result).toEqual(mockStaffCards);
    });
  });

  describe('getUnassignedCards', () => {
    it('should return unassigned cards', async () => {
      const mockUnassignedCards = [
        { id: 1, card_uid: 'CARD001', staff_id: null, vehicle_id: null },
      ];
      mockRfidCardService.getUnassignedCards.mockResolvedValue(
        mockUnassignedCards,
      );

      const result = await controller.getUnassignedCards('1');

      expect(service.getUnassignedCards).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUnassignedCards);
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      const mockStats = {
        totalCards: 10,
        activeCards: 8,
        inactiveCards: 2,
        assignmentRate: 0.8,
      };
      mockRfidCardService.getTenantStats.mockResolvedValue(mockStats);

      const result = await controller.getTenantStats('1');

      expect(service.getTenantStats).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStats);
    });
  });
});
