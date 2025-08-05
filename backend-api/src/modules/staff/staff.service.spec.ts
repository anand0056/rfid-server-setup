import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffService } from './staff.service';
import { Staff } from './staff.entity';
import { RfidCard } from '../rfid-card/rfid-card.entity';

describe('StaffService', () => {
  let service: StaffService;
  let staffRepository: Repository<Staff>;
  let cardRepository: Repository<RfidCard>;

  const mockStaffRepository = {
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
        StaffService,
        {
          provide: getRepositoryToken(Staff),
          useValue: mockStaffRepository,
        },
        {
          provide: getRepositoryToken(RfidCard),
          useValue: mockCardRepository,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    staffRepository = module.get<Repository<Staff>>(getRepositoryToken(Staff));
    cardRepository = module.get<Repository<RfidCard>>(
      getRepositoryToken(RfidCard),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockStaff = [
      {
        id: 1,
        tenant_id: 1,
        employee_id: 'EMP001',
        name: 'John Doe',
        rfid_cards: [],
        tenant: { id: 1, name: 'Tenant 1' },
      },
    ];

    it('should return all staff with tenant filter', async () => {
      mockStaffRepository.find.mockResolvedValue(mockStaff);

      const result = await service.findAll(1);

      expect(mockStaffRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 1 },
        relations: ['tenant', 'rfid_cards'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockStaff);
    });

    it('should return all staff without tenant filter', async () => {
      mockStaffRepository.find.mockResolvedValue(mockStaff);

      const result = await service.findAll();

      expect(mockStaffRepository.find).toHaveBeenCalledWith({
        relations: ['tenant', 'rfid_cards'],
        order: { tenant_id: 'ASC', created_at: 'DESC' },
      });
      expect(result).toEqual(mockStaff);
    });
  });

  describe('findOne', () => {
    const mockStaffMember = {
      id: 1,
      tenant_id: 1,
      employee_id: 'EMP001',
      name: 'John Doe',
      rfid_cards: [],
      tenant: { id: 1, name: 'Tenant 1' },
    };

    it('should return a staff member by id', async () => {
      mockStaffRepository.findOne.mockResolvedValue(mockStaffMember);

      const result = await service.findOne(1);

      expect(mockStaffRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['rfid_cards', 'tenant'],
      });
      expect(result).toEqual(mockStaffMember);
    });
  });

  describe('findByEmployeeId', () => {
    const mockStaffMember = {
      id: 1,
      employee_id: 'EMP001',
      name: 'John Doe',
      rfid_cards: [],
    };

    it('should find staff member by employee ID with tenant filter', async () => {
      mockStaffRepository.findOne.mockResolvedValue(mockStaffMember);

      const result = await service.findByEmployeeId('EMP001', 1);

      expect(mockStaffRepository.findOne).toHaveBeenCalledWith({
        where: { employee_id: 'EMP001', tenant_id: 1 },
        relations: ['rfid_cards'],
      });
      expect(result).toEqual(mockStaffMember);
    });
  });

  describe('create', () => {
    const mockStaffData = {
      tenant_id: 1,
      employee_id: 'EMP001',
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should create a new staff member', async () => {
      mockStaffRepository.create.mockReturnValue(mockStaffData);
      mockStaffRepository.save.mockResolvedValue(mockStaffData);

      const result = await service.create(mockStaffData);

      expect(mockStaffRepository.create).toHaveBeenCalledWith(mockStaffData);
      expect(mockStaffRepository.save).toHaveBeenCalledWith(mockStaffData);
      expect(result).toEqual(mockStaffData);
    });
  });

  describe('assignCard', () => {
    const mockStaff = {
      id: 1,
      employee_id: 'EMP001',
      name: 'John Doe',
    };

    const mockCard = {
      card_uid: 'CARD001',
      staff_id: null,
    };

    it('should assign an RFID card to a staff member', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      mockCardRepository.save.mockResolvedValue({ ...mockCard, staff_id: 1 });

      const result = await service.assignCard(1, 'CARD001');

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { card_uid: 'CARD001' },
      });
      expect(mockCardRepository.save).toHaveBeenCalledWith({
        ...mockCard,
        staff_id: 1,
      });
      expect(result).toEqual({ ...mockCard, staff_id: 1 });
    });

    it('should throw error if card not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(service.assignCard(1, 'INVALID')).rejects.toThrow();
    });
  });
});
