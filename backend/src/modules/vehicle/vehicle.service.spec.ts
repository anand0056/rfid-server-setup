import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './vehicle.entity';
import { RfidCard } from '../rfid-card/rfid-card.entity';

describe('VehicleService', () => {
  let service: VehicleService;
  let vehicleRepository: Repository<Vehicle>;
  let cardRepository: Repository<RfidCard>;

  const mockVehicleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCardRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
        {
          provide: getRepositoryToken(RfidCard),
          useValue: mockCardRepository,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepository = module.get<Repository<Vehicle>>(
      getRepositoryToken(Vehicle),
    );
    cardRepository = module.get<Repository<RfidCard>>(
      getRepositoryToken(RfidCard),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockVehicles = [
      {
        id: 1,
        tenant_id: 1,
        license_plate: 'ABC123',
        make: 'Toyota',
        model: 'Camry',
        rfid_cards: [],
        tenant: { id: 1, name: 'Tenant 1' },
      },
    ];

    it('should return all vehicles with tenant filter', async () => {
      mockVehicleRepository.find.mockResolvedValue(mockVehicles);

      const result = await service.findAll(1);

      expect(mockVehicleRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 1 },
        relations: ['rfid_cards', 'tenant'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockVehicles);
    });

    it('should return all vehicles without tenant filter', async () => {
      mockVehicleRepository.find.mockResolvedValue(mockVehicles);

      const result = await service.findAll();

      expect(mockVehicleRepository.find).toHaveBeenCalledWith({
        relations: ['rfid_cards', 'tenant'],
        order: { tenant_id: 'ASC', created_at: 'DESC' },
      });
      expect(result).toEqual(mockVehicles);
    });
  });

  describe('findOne', () => {
    const mockVehicle = {
      id: 1,
      tenant_id: 1,
      license_plate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      rfid_cards: [],
    };

    it('should return a vehicle by id', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne(1);

      expect(mockVehicleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['rfid_cards'],
      });
      expect(result).toEqual(mockVehicle);
    });
  });

  describe('findByLicensePlate', () => {
    const mockVehicle = {
      id: 1,
      license_plate: 'ABC123',
      rfid_cards: [],
    };

    it('should find vehicle by license plate with tenant filter', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findByLicensePlate('ABC123', 1);

      expect(mockVehicleRepository.findOne).toHaveBeenCalledWith({
        where: { license_plate: 'ABC123', tenant_id: 1 },
        relations: ['rfid_cards'],
      });
      expect(result).toEqual(mockVehicle);
    });
  });

  describe('create', () => {
    const mockVehicleData = {
      tenant_id: 1,
      license_plate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
    };

    it('should create a new vehicle', async () => {
      mockVehicleRepository.create.mockReturnValue(mockVehicleData);
      mockVehicleRepository.save.mockResolvedValue(mockVehicleData);

      const result = await service.create(mockVehicleData);

      expect(mockVehicleRepository.create).toHaveBeenCalledWith(
        mockVehicleData,
      );
      expect(mockVehicleRepository.save).toHaveBeenCalledWith(mockVehicleData);
      expect(result).toEqual(mockVehicleData);
    });
  });

  describe('assignCard', () => {
    const mockVehicle = {
      id: 1,
      license_plate: 'ABC123',
    };

    const mockCard = {
      card_uid: 'CARD001',
      vehicle_id: null,
    };

    it('should assign an RFID card to a vehicle', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      mockCardRepository.save.mockResolvedValue({ ...mockCard, vehicle_id: 1 });

      const result = await service.assignCard(1, 'CARD001');

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { card_uid: 'CARD001' },
      });
      expect(mockCardRepository.save).toHaveBeenCalledWith({
        ...mockCard,
        vehicle_id: 1,
      });
      expect(result).toEqual({ ...mockCard, vehicle_id: 1 });
    });

    it('should throw error if card not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(service.assignCard(1, 'INVALID')).rejects.toThrow();
    });
  });
});
