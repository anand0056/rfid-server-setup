import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantService } from './tenant.service';
import { Tenant } from './tenant.entity';

describe('TenantService', () => {
  let service: TenantService;
  let repository: Repository<Tenant>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockTenants = [
      {
        id: 1,
        name: 'Tenant 1',
        contact_person: 'John Doe',
        contact_email: 'john@example.com',
        contact_phone: '+1234567890',
        address: 'Address 1',
        is_active: true,
      },
    ];

    it('should return all active tenants', async () => {
      mockRepository.find.mockResolvedValue(mockTenants);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { is_active: true },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockTenants);
    });
  });

  describe('findOne', () => {
    const mockTenant = {
      id: 1,
      name: 'Tenant 1',
      contact_person: 'John Doe',
      contact_email: 'john@example.com',
      contact_phone: '+1234567890',
      address: 'Address 1',
      is_active: true,
      reader_groups: [],
      cards: [],
      staff: [],
      vehicles: [],
    };

    it('should return a tenant by id with relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['reader_groups', 'cards', 'staff', 'vehicles'],
      });
      expect(result).toEqual(mockTenant);
    });

    it('should return null for non-existent tenant', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const mockTenantData = {
      name: 'New Tenant',
      contact_person: 'Jane Doe',
      contact_email: 'jane@example.com',
      contact_phone: '+1234567890',
      address: 'New Address',
      is_active: true,
    };

    it('should create a new tenant', async () => {
      mockRepository.create.mockReturnValue(mockTenantData);
      mockRepository.save.mockResolvedValue(mockTenantData);

      const result = await service.create(mockTenantData);

      expect(mockRepository.create).toHaveBeenCalledWith(mockTenantData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTenantData);
      expect(result).toEqual(mockTenantData);
    });
  });

  describe('update', () => {
    const mockTenantData = {
      name: 'Updated Tenant',
      contact_person: 'Jane Doe Updated',
    };

    const mockUpdatedTenant = {
      id: 1,
      ...mockTenantData,
      contact_email: 'jane@example.com',
      contact_phone: '+1234567890',
      address: 'Address',
      is_active: true,
    };

    it('should update a tenant', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockUpdatedTenant);

      const result = await service.update(1, mockTenantData);

      expect(mockRepository.update).toHaveBeenCalledWith(1, mockTenantData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'readers',
          'reader_groups',
          'cards',
          'logs',
          'staff',
          'vehicles',
        ],
      });
      expect(result).toEqual(mockUpdatedTenant);
    });

    it('should return null when tenant not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, mockTenantData);

      expect(result).toBeNull();
    });
  });

  describe('getTenantStats', () => {
    const mockTenant = {
      id: 1,
      name: 'Tenant 1',
      reader_groups: [],
      cards: [],
      staff: [],
      vehicles: [],
    };

    it('should return tenant statistics', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.createQueryBuilder.mockReturnThis();
      mockRepository.getCount
        .mockResolvedValueOnce(5) // totalReaders
        .mockResolvedValueOnce(3); // onlineReaders

      const result = await service.getTenantStats(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['reader_groups', 'cards', 'staff', 'vehicles'],
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('tenant');
      expect(result).toEqual({
        tenant_name: mockTenant.name,
        total_readers: 5,
        online_readers: 3,
      });
    });

    it('should throw error if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getTenantStats(999)).rejects.toThrow(
        'Tenant not found',
      );
    });
  });

  describe('findByCode', () => {
    const mockTenant = {
      id: 1,
      name: 'Tenant 1',
      tenant_code: 'TENANT1',
      reader_groups: [],
    };

    it('should return a tenant by code with reader groups relation', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findByCode('TENANT1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tenant_code: 'TENANT1' },
        relations: ['reader_groups'],
      });
      expect(result).toEqual(mockTenant);
    });

    it('should return null for non-existent tenant code', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });
});
