import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidReaderService } from './rfid-reader.service';
import { RfidReader } from './rfid-reader.entity';

describe('RfidReaderService', () => {
  let service: RfidReaderService;
  let repository: Repository<RfidReader>;

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    manager: {
      getRepository: jest.fn().mockReturnThis(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidReaderService,
        {
          provide: getRepositoryToken(RfidReader),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RfidReaderService>(RfidReaderService);
    repository = module.get<Repository<RfidReader>>(
      getRepositoryToken(RfidReader),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReaders', () => {
    const mockReaders = [
      {
        id: 1,
        tenant_id: 1,
        reader_id: 'READER001',
        name: 'Main Entrance',
        location: 'Building A',
        ip_address: '192.168.1.100',
        is_online: true,
      },
      {
        id: 2,
        tenant_id: 1,
        reader_id: 'READER002',
        name: 'Side Gate',
        location: 'Building B',
        ip_address: '192.168.1.101',
        is_online: false,
      },
    ];

    it('should return all readers', async () => {
      mockRepository.getMany.mockResolvedValue(mockReaders);

      const result = await service.getReaders();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('reader');
      expect(mockRepository.leftJoinAndSelect).toHaveBeenCalledWith(
        'reader.tenant',
        'tenant',
      );
      expect(mockRepository.orderBy).toHaveBeenCalledWith(
        'reader.tenant_id',
        'ASC',
      );
      expect(mockRepository.addOrderBy).toHaveBeenCalledWith(
        'reader.name',
        'ASC',
      );
      expect(result).toEqual(mockReaders);
    });

    it('should filter by tenant ID', async () => {
      mockRepository.getMany.mockResolvedValue([mockReaders[0]]);

      await service.getReaders(1);

      expect(mockRepository.where).toHaveBeenCalledWith(
        'reader.tenant_id = :tenantId',
        { tenantId: 1 },
      );
    });

    it('should filter by online status', async () => {
      mockRepository.getMany.mockResolvedValue([mockReaders[0]]);

      await service.getReaders(undefined, true);

      expect(mockRepository.andWhere).toHaveBeenCalledWith(
        'reader.is_online = :isOnline',
        { isOnline: true },
      );
    });
  });

  describe('getReaderById', () => {
    const mockReader = {
      id: 1,
      reader_id: 'READER001',
      name: 'Main Entrance',
    };

    it('should return a reader by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockReader);

      const result = await service.getReaderById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockReader);
    });
  });

  describe('createReader', () => {
    const mockReader = {
      reader_id: 'READER003',
      name: 'New Reader',
      tenant_id: 1,
      reader_group_id: 1,
    };

    it('should create a reader with valid group ID', async () => {
      mockRepository.manager.getOne.mockResolvedValue({ id: 1 });
      mockRepository.save.mockResolvedValue({ id: 3, ...mockReader });

      const result = await service.createReader(mockReader);

      expect(mockRepository.manager.getRepository).toHaveBeenCalledWith(
        'rfid_reader_groups',
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockReader);
      expect(result).toEqual({ id: 3, ...mockReader });
    });

    it('should create a reader without group ID if group not found', async () => {
      mockRepository.manager.getOne.mockResolvedValue(null);
      const readerWithoutGroup = { ...mockReader } as any;
      delete readerWithoutGroup.reader_group_id;

      mockRepository.save.mockResolvedValue({ id: 3, ...readerWithoutGroup });

      await service.createReader(mockReader);

      expect(mockRepository.save).toHaveBeenCalledWith(readerWithoutGroup);
    });
  });
});
