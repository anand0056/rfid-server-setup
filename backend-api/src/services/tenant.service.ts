import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['reader_groups', 'cards', 'staff', 'vehicles'],
    });
  }

  async findByCode(tenantCode: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { tenant_code: tenantCode },
      relations: ['reader_groups'],
    });
  }

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async update(
    id: number,
    updateData: Partial<Tenant>,
  ): Promise<Tenant | null> {
    await this.tenantRepository.update(id, updateData);
    return this.findOne(id);
  }

  async getTenantStats(tenantId: number) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['reader_groups', 'cards', 'staff', 'vehicles'],
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const totalReaders = await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoin('tenant.reader_groups', 'rg')
      .leftJoin('rg.readers', 'r')
      .where('tenant.id = :tenantId', { tenantId })
      .getCount();

    const onlineReaders = await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoin('tenant.reader_groups', 'rg')
      .leftJoin('rg.readers', 'r')
      .where('tenant.id = :tenantId', { tenantId })
      .andWhere('r.is_online = :online', { online: true })
      .getCount();

    return {
      tenant_name: tenant.name,
      total_readers: totalReaders,
      online_readers: onlineReaders,
      offline_readers: totalReaders - onlineReaders,
      total_cards: tenant.cards?.length || 0,
      staff_cards:
        tenant.cards?.filter((c) => c.card_type === 'staff').length || 0,
      vehicle_cards:
        tenant.cards?.filter((c) => c.card_type === 'vehicle').length || 0,
      total_staff: tenant.staff?.length || 0,
      total_vehicles: tenant.vehicles?.length || 0,
    };
  }
}
