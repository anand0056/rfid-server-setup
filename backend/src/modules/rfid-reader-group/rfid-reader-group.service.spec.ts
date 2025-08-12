import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidReaderGroupService } from './rfid-reader-group.service';
import { RfidReaderGroup } from './rfid-reader-group.entity';

describe('RfidReaderGroupService', () => {
  let service: RfidReaderGroupService;
  let repository: Repository<RfidReaderGroup>;

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidReaderGroupService,
        {
          provide: getRepositoryToken(RfidReaderGroup),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RfidReaderGroupService>(RfidReaderGroupService);
    repository = module.get<Repository<RfidReaderGroup>>(
      getRepositoryToken(RfidReaderGroup),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockGroups = [
      {
        id: 1,
        tenant_id: 1,
        group_name: 'Building A',
        description: 'Main building readers',
        location: 'Building A',
        is_active: true,
        tenant: { id: 1, name: 'Tenant 1' },
      },
    ];

    it('should return all reader groups', async () => {
      mockRepository.getMany.mockResolvedValue(mockGroups);

      const result = await service.findAll();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('group');
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'group.tenant',
        'tenant',
      );
      expect(mockRepository.orderBy).toHaveBeenCalledWith(
        'group.tenant_id',
        'ASC',
      );
      expect(result).toEqual(mockGroups);
    });

    it('should filter by tenant ID', async () => {
      mockRepository.getMany.mockResolvedValue([mockGroups[0]]);

      const result = await service.findAll(1);

      expect(mockRepository.where).toHaveBeenCalledWith(
        'group.tenant_id = :tenantId',
        { tenantId: 1 },
      );
      expect(result).toEqual([mockGroups[0]]);
    });
  });

  describe('findOne', () => {
    const mockGroup = {
      id: 1,
      tenant_id: 1,
      group_name: 'Building A',
      description: 'Main building readers',
      location: 'Building A',
      is_active: true,
      tenant: { id: 1, name: 'Tenant 1' },
      readers: [],
    };

    it('should return a reader group by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockGroup);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['tenant', 'readers'],
      });
      expect(result).toEqual(mockGroup);
    });

    it('should return null for non-existent group', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const mockGroupData = {
      tenant_id: 1,
      group_name: 'Building A',
      description: 'Main building readers',
      location: 'Building A',
      is_active: true,
    };

    it('should create a new reader group', async () => {
      mockRepository.create.mockReturnValue(mockGroupData);
      mockRepository.save.mockResolvedValue(mockGroupData);

      const result = await service.create(mockGroupData);

      expect(mockRepository.create).toHaveBeenCalledWith(mockGroupData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockGroupData);
      expect(result).toEqual(mockGroupData);
    });
  });

  describe('delete', () => {
    it('should delete a reader group', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should return deleted: false when no group was deleted', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete(999);

      expect(mockRepository.delete).toHaveBeenCalledWith(999);
      expect(result).toEqual({ deleted: false });
    });
  });
});
