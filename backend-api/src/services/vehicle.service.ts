import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { RfidCard } from '../entities/rfid-card.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(RfidCard)
    private cardRepository: Repository<RfidCard>,
  ) {}

  async findAll(tenantId?: number): Promise<Vehicle[]> {
    if (tenantId) {
      return this.vehicleRepository.find({
        where: { tenant_id: tenantId },
        relations: ['rfid_cards', 'tenant'],
        order: { created_at: 'DESC' },
      });
    } else {
      // Return all vehicles from all tenants with tenant information
      return this.vehicleRepository.find({
        relations: ['rfid_cards', 'tenant'],
        order: { tenant_id: 'ASC', created_at: 'DESC' },
      });
    }
  }

  async findOne(id: number): Promise<Vehicle | null> {
    return this.vehicleRepository.findOne({
      where: { id },
      relations: ['rfid_cards'],
    });
  }

  async findByLicensePlate(
    licensePlate: string,
    tenantId?: number,
  ): Promise<Vehicle | null> {
    if (tenantId) {
      return this.vehicleRepository.findOne({
        where: { license_plate: licensePlate, tenant_id: tenantId },
        relations: ['rfid_cards', 'tenant'],
      });
    } else {
      // Search across all tenants
      return this.vehicleRepository.findOne({
        where: { license_plate: licensePlate },
        relations: ['rfid_cards', 'tenant'],
      });
    }
  }

  async create(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(vehicleData);
    return this.vehicleRepository.save(vehicle);
  }

  async update(
    id: number,
    updateData: Partial<Vehicle>,
  ): Promise<Vehicle | null> {
    await this.vehicleRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    // First, unassign any RFID cards from this vehicle
    await this.cardRepository.update({ vehicle_id: id }, { vehicle_id: null });

    await this.vehicleRepository.delete(id);
  }

  async assignCard(vehicleId: number, cardUid: string): Promise<RfidCard> {
    const vehicle = await this.findOne(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const card = await this.cardRepository.findOne({
      where: { card_uid: cardUid },
    });

    if (!card) {
      throw new Error('RFID card not found');
    }

    // Update card to be assigned to vehicle
    card.vehicle_id = vehicleId;
    card.card_type = 'vehicle';

    return this.cardRepository.save(card);
  }

  async unassignCard(cardUid: string): Promise<RfidCard> {
    const card = await this.cardRepository.findOne({
      where: { card_uid: cardUid },
    });

    if (!card) {
      throw new Error('RFID card not found');
    }

    card.vehicle_id = null;
    card.card_type = 'visitor';

    return this.cardRepository.save(card);
  }

  async getVehicleStats(tenantId?: number) {
    if (tenantId) {
      const total = await this.vehicleRepository.count({
        where: { tenant_id: tenantId },
      });
      const activeVehicles = await this.vehicleRepository.count({
        where: { tenant_id: tenantId, is_active: true },
      });
      const vehiclesWithCards = await this.vehicleRepository
        .createQueryBuilder('vehicle')
        .leftJoin('vehicle.rfid_cards', 'card')
        .where('vehicle.tenant_id = :tenantId', { tenantId })
        .andWhere('card.id IS NOT NULL')
        .getCount();

      const recentRegistrations = await this.vehicleRepository.count({
        where: {
          tenant_id: tenantId,
          registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      });

      return {
        total,
        active: activeVehicles,
        withCards: vehiclesWithCards,
        recentRegistrations,
      };
    } else {
      // Return stats for all tenants
      const total = await this.vehicleRepository.count();
      const activeVehicles = await this.vehicleRepository.count({
        where: { is_active: true },
      });
      const vehiclesWithCards = await this.vehicleRepository
        .createQueryBuilder('vehicle')
        .leftJoin('vehicle.rfid_cards', 'card')
        .where('card.id IS NOT NULL')
        .getCount();

      const recentRegistrations = await this.vehicleRepository.count({
        where: {
          registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      });

      return {
        total,
        active: activeVehicles,
        withCards: vehiclesWithCards,
        recentRegistrations,
      };
    }
  }
}
