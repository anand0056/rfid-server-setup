import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './staff.entity';
import { RfidCard } from '../rfid-card/rfid-card.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(RfidCard)
    private cardRepository: Repository<RfidCard>,
  ) {}

  async findAll(tenantId?: number): Promise<Staff[]> {
    if (tenantId) {
      return this.staffRepository.find({
        where: { tenant_id: tenantId },
        relations: ['tenant', 'rfid_cards'],
        order: { created_at: 'DESC' },
      });
    } else {
      // Return all staff from all tenants with tenant information
      return this.staffRepository.find({
        relations: ['tenant', 'rfid_cards'],
        order: { tenant_id: 'ASC', created_at: 'DESC' },
      });
    }
  }

  async findOne(id: number): Promise<Staff | null> {
    return this.staffRepository.findOne({
      where: { id },
      relations: ['rfid_cards', 'tenant'],
    });
  }

  async findByEmployeeId(
    employeeId: string,
    tenantId?: number,
  ): Promise<Staff | null> {
    if (tenantId) {
      return this.staffRepository.findOne({
        where: { employee_id: employeeId, tenant_id: tenantId },
        relations: ['rfid_cards', 'tenant'],
      });
    } else {
      // Search across all tenants
      return this.staffRepository.findOne({
        where: { employee_id: employeeId },
        relations: ['rfid_cards', 'tenant'],
      });
    }
  }

  async create(staffData: Partial<Staff>): Promise<Staff> {
    const staff = this.staffRepository.create(staffData);
    return this.staffRepository.save(staff);
  }

  async update(id: number, updateData: Partial<Staff>): Promise<Staff | null> {
    await this.staffRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    // First, unassign any RFID cards from this staff member
    await this.cardRepository.update(
      { staff_id: id },
      { staff_id: null, card_type: 'visitor' },
    );

    await this.staffRepository.delete(id);
  }

  async assignCard(staffId: number, cardUid: string): Promise<RfidCard> {
    const staff = await this.findOne(staffId);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    const card = await this.cardRepository.findOne({
      where: { card_uid: cardUid, tenant_id: staff.tenant_id },
    });

    if (!card) {
      throw new Error('RFID card not found');
    }

    // Update card to be assigned to staff
    card.staff_id = staffId;
    card.card_type = 'staff';
    card.vehicle_id = null; // Ensure it's not assigned to vehicle

    return this.cardRepository.save(card);
  }

  async unassignCard(cardUid: string): Promise<RfidCard> {
    const card = await this.cardRepository.findOne({
      where: { card_uid: cardUid },
    });

    if (!card) {
      throw new Error('RFID card not found');
    }

    card.staff_id = null;
    card.card_type = 'visitor';

    return this.cardRepository.save(card);
  }

  async getStaffStats(tenantId: number) {
    const total = await this.staffRepository.count({
      where: { tenant_id: tenantId },
    });

    const active = await this.staffRepository.count({
      where: { tenant_id: tenantId, is_active: true },
    });

    const withCards = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoin('staff.rfid_cards', 'card')
      .where('staff.tenant_id = :tenantId', { tenantId })
      .andWhere('card.id IS NOT NULL')
      .getCount();

    const recentHires = await this.staffRepository.count({
      where: {
        tenant_id: tenantId,
        hire_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    });

    return {
      total,
      active,
      inactive: total - active,
      withCards,
      recentHires,
    };
  }
}
