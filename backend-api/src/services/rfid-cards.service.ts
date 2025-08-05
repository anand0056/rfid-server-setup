import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidCard } from '../entities/rfid-card.entity';
import { RfidReader } from '../entities/rfid-reader.entity';
import { Staff } from '../entities/staff.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class RfidCardService {
  constructor(
    @InjectRepository(RfidCard)
    private cardRepository: Repository<RfidCard>,
    @InjectRepository(RfidReader)
    private readerRepository: Repository<RfidReader>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async getCards(tenantId?: number, activeOnly?: boolean) {
    const query = this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.staff', 'staff')
      .leftJoinAndSelect('card.vehicle', 'vehicle')
      .leftJoinAndSelect('card.tenant', 'tenant');

    if (tenantId) {
      query.where('card.tenant_id = :tenantId', { tenantId });
    }

    if (activeOnly) {
      query.andWhere('card.is_active = :active', { active: true });
    }

    const cards = await query
      .orderBy('card.tenant_id', 'ASC')
      .getMany();

    return cards.map(card => ({
      ...card,
      uid: card.card_uid,
      assigned_staff_id: card.staff_id,
      assigned_vehicle_id: card.vehicle_id,
    }));
  }

  async getCardByUid(uid: string, tenantId?: number) {
    const query = this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.staff', 'staff')
      .leftJoinAndSelect('card.vehicle', 'vehicle')
      .where('card.card_uid = :uid', { uid });

    if (tenantId) {
      query.andWhere('card.tenant_id = :tenantId', { tenantId });
    }

    const card = await query.getOne();

    return card
      ? {
          ...card,
          uid: card.card_uid,
          assigned_staff_id: card.staff_id,
          assigned_vehicle_id: card.vehicle_id,
        }
      : null;
  }

  async createCard(cardData: Partial<RfidCard>) {
    const card = this.cardRepository.create(cardData);
    return this.cardRepository.save(card);
  }

  async updateCard(uid: string, cardData: Partial<RfidCard>, tenantId?: number) {
    const query = this.cardRepository
      .createQueryBuilder()
      .update(RfidCard)
      .set(cardData)
      .where('card_uid = :uid', { uid });

    if (tenantId) {
      query.andWhere('tenant_id = :tenantId', { tenantId });
    }

    await query.execute();
    return this.getCardByUid(uid, tenantId);
  }

  async deleteCard(uid: string, tenantId?: number) {
    const query = this.cardRepository
      .createQueryBuilder()
      .delete()
      .from(RfidCard)
      .where('card_uid = :uid', { uid });

    if (tenantId) {
      query.andWhere('tenant_id = :tenantId', { tenantId });
    }

    const result = await query.execute();
    return {
      deleted: (result.affected || 0) > 0,
      affected: result.affected || 0,
    };
  }

  // Comprehensive method to get all tenant data: staff, vehicles, cards, and readers
  async getTenantOverview(tenantId: number) {
    try {
      const [cards, readers, staff, vehicles, tenant] = await Promise.all([
        this.getTenantCards(tenantId),
        this.getTenantReaders(tenantId),
        this.getTenantStaff(tenantId),
        this.getTenantVehicles(tenantId),
        this.tenantRepository.findOne({ where: { id: tenantId } })
      ]);

      return {
        tenant,
        cards,
        readers,
        staff,
        vehicles,
        summary: {
          totalCards: cards.length,
          staffCards: cards.filter(c => c.staff_id).length,
          vehicleCards: cards.filter(c => c.vehicle_id).length,
          totalReaders: readers.length,
          activeReaders: readers.filter(r => r.is_online).length,
          totalStaff: staff.length,
          totalVehicles: vehicles.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get tenant overview: ${error.message}`);
    }
  }

  // Get all cards for a specific tenant with full details
  async getTenantCards(tenantId: number) {
    return this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.staff', 'staff')
      .leftJoinAndSelect('card.vehicle', 'vehicle')
      .where('card.tenant_id = :tenantId', { tenantId })
      .orderBy('card.created_at', 'DESC')
      .getMany();
  }

  // Get all readers for a specific tenant
  async getTenantReaders(tenantId: number) {
    return this.readerRepository
      .createQueryBuilder('reader')
      .where('reader.tenant_id = :tenantId', { tenantId })
      .orderBy('reader.name', 'ASC')
      .getMany();
  }

  // Get all staff for a specific tenant
  async getTenantStaff(tenantId: number) {
    return this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.rfidCards', 'cards')
      .where('staff.tenant_id = :tenantId', { tenantId })
      .orderBy('staff.name', 'ASC')
      .getMany();
  }

  // Get all vehicles for a specific tenant
  async getTenantVehicles(tenantId: number) {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.rfidCards', 'cards')
      .where('vehicle.tenant_id = :tenantId', { tenantId })
      .orderBy('vehicle.license_plate', 'ASC')
      .getMany();
  }

  // Get cards by type (staff or vehicle)
  async getCardsByType(tenantId: number, type: 'staff' | 'vehicle') {
    const query = this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.staff', 'staff')
      .leftJoinAndSelect('card.vehicle', 'vehicle')
      .where('card.tenant_id = :tenantId', { tenantId });

    if (type === 'staff') {
      query.andWhere('card.staff_id IS NOT NULL');
    } else if (type === 'vehicle') {
      query.andWhere('card.vehicle_id IS NOT NULL');
    }

    return query.orderBy('card.created_at', 'DESC').getMany();
  }

  // Get unassigned cards for a tenant
  async getUnassignedCards(tenantId: number) {
    return this.cardRepository
      .createQueryBuilder('card')
      .where('card.tenant_id = :tenantId', { tenantId })
      .andWhere('card.staff_id IS NULL')
      .andWhere('card.vehicle_id IS NULL')
      .orderBy('card.created_at', 'DESC')
      .getMany();
  }

  // Get reader status with associated cards
  async getReaderWithCards(readerId: number, tenantId?: number) {
    const query = this.readerRepository
      .createQueryBuilder('reader')
      .leftJoinAndSelect('reader.rfidCards', 'cards')
      .leftJoinAndSelect('cards.staff', 'staff')
      .leftJoinAndSelect('cards.vehicle', 'vehicle')
      .where('reader.id = :readerId', { readerId });

    if (tenantId) {
      query.andWhere('reader.tenant_id = :tenantId', { tenantId });
    }

    return query.getOne();
  }

  // Get tenant statistics
  async getTenantStats(tenantId: number) {
    const [
      totalCards,
      activeCards,
      staffCards,
      vehicleCards,
      totalReaders,
      activeReaders
    ] = await Promise.all([
      this.cardRepository.count({ where: { tenant_id: tenantId } }),
      this.cardRepository.count({ where: { tenant_id: tenantId, is_active: true } }),
      this.cardRepository.count({ 
        where: { tenant_id: tenantId }, 
        relations: ['staff'],
        // This will count cards that have staff assigned
      }),
      this.cardRepository.count({ 
        where: { tenant_id: tenantId }, 
        relations: ['vehicle'],
        // This will count cards that have vehicles assigned
      }),
      this.readerRepository.count({ where: { tenant_id: tenantId } }),
      this.readerRepository.count({ where: { tenant_id: tenantId, is_online: true } })
    ]);

    return {
      cards: {
        total: totalCards,
        active: activeCards,
        staff: staffCards,
        vehicle: vehicleCards,
        inactive: totalCards - activeCards
      },
      readers: {
        total: totalReaders,
        active: activeReaders,
        inactive: totalReaders - activeReaders
      }
    };
  }
}
