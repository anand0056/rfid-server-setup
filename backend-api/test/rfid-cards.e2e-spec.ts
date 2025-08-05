import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidCard } from '../src/entities/rfid-card.entity';
import { RfidReader } from '../src/entities/rfid-reader.entity';
import { Staff } from '../src/entities/staff.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { Tenant } from '../src/entities/tenant.entity';

describe('RfidCard API (e2e)', () => {
  let app: INestApplication<App>;
  let cardRepository: Repository<RfidCard>;
  let readerRepository: Repository<RfidReader>;
  let staffRepository: Repository<Staff>;
  let vehicleRepository: Repository<Vehicle>;
  let tenantRepository: Repository<Tenant>;

  // Test data
  const testTenant = {
    id: 1,
    name: 'Test Tenant E2E',
    tenant_code: 'E2E001',
    description: 'End-to-end test tenant',
    contact_email: 'test@e2e.com',
    contact_phone: '+1234567890',
    address: '123 Test Street',
    is_active: true,
  };

  const testStaff = {
    id: 1,
    tenant_id: 1,
    name: 'John Doe E2E',
    employee_id: 'EMP001E2E',
    department: 'IT',
    position: 'Developer',
    email: 'john@e2e.com',
    phone: '+1234567890',
    is_active: true,
  };

  const testVehicle = {
    id: 1,
    tenant_id: 1,
    license_plate: 'E2E123',
    make: 'Toyota',
    model: 'Camry',
    year: '2023',
    color: 'Blue',
    vehicle_type: 'sedan',
    is_active: true,
  } as any;

  const testCard = {
    id: 1,
    tenant_id: 1,
    card_uid: 'E2ECARD001',
    card_number: '1234567890',
    card_type: 'staff' as const,
    staff_id: 1,
    vehicle_id: null,
    description: 'E2E test card',
    is_active: true,
    issued_at: new Date(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  } as any;

  const testReader = {
    id: 1,
    tenant_id: 1,
    reader_id: 'E2EREADER001',
    name: 'E2E Main Entrance',
    location: 'Building A E2E',
    ip_address: '192.168.1.100',
    mac_address: '00:11:22:33:44:55',
    is_online: true,
    last_heartbeat: new Date(),
    configuration: '{}',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get repositories for test data setup
    cardRepository = moduleFixture.get<Repository<RfidCard>>(getRepositoryToken(RfidCard));
    readerRepository = moduleFixture.get<Repository<RfidReader>>(getRepositoryToken(RfidReader));
    staffRepository = moduleFixture.get<Repository<Staff>>(getRepositoryToken(Staff));
    vehicleRepository = moduleFixture.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  beforeEach(async () => {
    // Clean up test data
    await cardRepository.delete({});
    await readerRepository.delete({});
    await staffRepository.delete({});
    await vehicleRepository.delete({});
    await tenantRepository.delete({});

    // Set up test data
    await tenantRepository.save(testTenant);
    await staffRepository.save(testStaff);
    await vehicleRepository.save(testVehicle);
    await readerRepository.save(testReader);
    await cardRepository.save(testCard);
  });

  afterAll(async () => {
    // Clean up test data
    await cardRepository.delete({});
    await readerRepository.delete({});
    await staffRepository.delete({});
    await vehicleRepository.delete({});
    await tenantRepository.delete({});
    
    await app.close();
  });

  describe('/api/rfid/cards (GET)', () => {
    it('should return all cards', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('uid', 'E2ECARD001');
          expect(res.body[0]).toHaveProperty('assigned_staff_id', 1);
        });
    });

    it('should filter cards by tenant', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards?tenantId=1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((card: any) => card.tenant_id === 1)).toBe(true);
        });
    });

    it('should filter active cards only', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards?active=true')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((card: any) => card.is_active === true)).toBe(true);
        });
    });
  });

  describe('/api/rfid/cards/tenant/:tenantId/overview (GET)', () => {
    it('should return comprehensive tenant overview', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/1/overview')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tenant');
          expect(res.body).toHaveProperty('cards');
          expect(res.body).toHaveProperty('readers');
          expect(res.body).toHaveProperty('staff');
          expect(res.body).toHaveProperty('vehicles');
          expect(res.body).toHaveProperty('summary');
          
          expect(res.body.tenant).toHaveProperty('id', 1);
          expect(res.body.summary).toHaveProperty('totalCards');
          expect(res.body.summary).toHaveProperty('staffCards');
          expect(res.body.summary).toHaveProperty('vehicleCards');
          expect(res.body.summary).toHaveProperty('totalReaders');
          expect(res.body.summary).toHaveProperty('activeReaders');
        });
    });

    it('should return 500 for invalid tenant ID', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/999/overview')
        .expect(500);
    });
  });

  describe('/api/rfid/cards/tenant/:tenantId/type/:type (GET)', () => {
    it('should return staff cards', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/1/type/staff')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((card: any) => card.staff_id !== null)).toBe(true);
        });
    });

    it('should return vehicle cards', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/1/type/vehicle')
        .expect(200);
    });
  });

  describe('/api/rfid/cards/tenant/:tenantId/unassigned (GET)', () => {
    it('should return unassigned cards', async () => {
      // Create an unassigned card
      const unassignedCard = {
        tenant_id: 1,
        card_uid: 'UNASSIGNED001',
        card_number: '9999999999',
        card_type: 'staff' as const,
        staff_id: null,
        vehicle_id: null,
        description: 'Unassigned test card',
        is_active: true,
        issued_at: new Date(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
      
      await cardRepository.save(unassignedCard);

      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/1/unassigned')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.some((card: any) => 
            card.staff_id === null && card.vehicle_id === null
          )).toBe(true);
        });
    });
  });

  describe('/api/rfid/cards/tenant/:tenantId/stats (GET)', () => {
    it('should return tenant statistics', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/1/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('cards');
          expect(res.body).toHaveProperty('readers');
          
          expect(res.body.cards).toHaveProperty('total');
          expect(res.body.cards).toHaveProperty('active');
          expect(res.body.cards).toHaveProperty('staff');
          expect(res.body.cards).toHaveProperty('vehicle');
          expect(res.body.cards).toHaveProperty('inactive');
          
          expect(res.body.readers).toHaveProperty('total');
          expect(res.body.readers).toHaveProperty('active');
          expect(res.body.readers).toHaveProperty('inactive');
        });
    });
  });

  describe('/api/rfid/cards/reader/:readerId (GET)', () => {
    it('should return reader with associated cards', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/reader/1?tenantId=1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('name', 'E2E Main Entrance');
        });
    });

    it('should return reader without tenant filter', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/reader/1')
        .expect(200);
    });
  });

  describe('/api/rfid/cards/:uid (GET)', () => {
    it('should return card by UID', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/E2ECARD001')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('uid', 'E2ECARD001');
          expect(res.body).toHaveProperty('assigned_staff_id', 1);
        });
    });

    it('should return card by UID with tenant filter', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/E2ECARD001?tenantId=1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('uid', 'E2ECARD001');
          expect(res.body).toHaveProperty('tenant_id', 1);
        });
    });

    it('should return null for non-existent card', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/NONEXISTENT')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeNull();
        });
    });
  });

  describe('/api/rfid/cards (POST)', () => {
    it('should create a new card', () => {
      const newCardData = {
        uid: 'NEWCARD001',
        assigned_staff_id: 1,
        assigned_vehicle_id: null,
        tenant_id: 1,
        card_number: '2222222222',
        card_type: 'staff',
        description: 'New test card',
        is_active: true,
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/rfid/cards')
        .send(newCardData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('card_uid', 'NEWCARD001');
          expect(res.body).toHaveProperty('staff_id', 1);
        });
    });

    it('should create a vehicle card', () => {
      const vehicleCardData = {
        uid: 'VEHICLECARD001',
        assigned_staff_id: null,
        assigned_vehicle_id: 1,
        tenant_id: 1,
        card_number: '3333333333',
        card_type: 'vehicle',
        description: 'Vehicle test card',
        is_active: true,
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/rfid/cards')
        .send(vehicleCardData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('vehicle_id', 1);
          expect(res.body).toHaveProperty('staff_id', null);
        });
    });
  });

  describe('/api/rfid/cards/:uid (PUT)', () => {
    it('should update a card', () => {
      const updateData = {
        card_number: '5555555555',
        description: 'Updated test card',
        is_active: false,
      };

      return request(app.getHttpServer())
        .put('/api/rfid/cards/E2ECARD001')
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('uid', 'E2ECARD001');
        });
    });

    it('should update card with tenant filter', () => {
      const updateData = {
        uid: 'E2ECARD001_UPDATED',
        assigned_staff_id: null,
        assigned_vehicle_id: 1,
        card_number: '6666666666',
      };

      return request(app.getHttpServer())
        .put('/api/rfid/cards/E2ECARD001?tenantId=1')
        .send(updateData)
        .expect(200);
    });
  });

  describe('/api/rfid/cards/:uid (DELETE)', () => {
    it('should delete a card', () => {
      return request(app.getHttpServer())
        .delete('/api/rfid/cards/E2ECARD001')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('deleted', true);
          expect(res.body).toHaveProperty('affected', 1);
        });
    });

    it('should delete card with tenant filter', async () => {
      // Create a card specifically for this test
      const deleteTestCard = {
        tenant_id: 1,
        card_uid: 'DELETECARD001',
        card_number: '7777777777',
        card_type: 'staff' as const,
        staff_id: 1,
        vehicle_id: null,
        description: 'Card to be deleted',
        is_active: true,
        issued_at: new Date(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
      
      await cardRepository.save(deleteTestCard);

      return request(app.getHttpServer())
        .delete('/api/rfid/cards/DELETECARD001?tenantId=1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('deleted', true);
          expect(res.body).toHaveProperty('affected', 1);
        });
    });

    it('should return false when deleting non-existent card', () => {
      return request(app.getHttpServer())
        .delete('/api/rfid/cards/NONEXISTENT')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('deleted', false);
          expect(res.body).toHaveProperty('affected', 0);
        });
    });
  });

  describe('Error handling', () => {
    it('should handle invalid tenant ID in overview', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/tenant/abc/overview')
        .expect(400);
    });

    it('should handle invalid reader ID', () => {
      return request(app.getHttpServer())
        .get('/api/rfid/cards/reader/abc')
        .expect(400);
    });

    it('should handle malformed request body in POST', () => {
      return request(app.getHttpServer())
        .post('/api/rfid/cards')
        .send('invalid json')
        .expect(400);
    });
  });
});
