import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidReaderGroup } from './rfid-reader-group.entity';

@Injectable()
export class RfidReaderGroupService {
  constructor(
    @InjectRepository(RfidReaderGroup)
    private readerGroupRepository: Repository<RfidReaderGroup>,
  ) {}

  async findAll(tenantId?: number): Promise<RfidReaderGroup[]> {
    const query = this.readerGroupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.tenant', 'tenant');

    if (tenantId) {
      query.where('group.tenant_id = :tenantId', { tenantId });
    }

    return query.orderBy('group.tenant_id', 'ASC').getMany();
  }

  async findOne(id: number): Promise<RfidReaderGroup | null> {
    return this.readerGroupRepository.findOne({
      where: { id },
      relations: ['tenant', 'readers'],
    });
  }

  async create(groupData: Partial<RfidReaderGroup>): Promise<RfidReaderGroup> {
    const group = this.readerGroupRepository.create(groupData);
    return this.readerGroupRepository.save(group);
  }

  async update(
    id: number,
    updateData: Partial<RfidReaderGroup>,
  ): Promise<RfidReaderGroup | null> {
    await this.readerGroupRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<{ deleted: boolean }> {
    await this.readerGroupRepository.delete(id);
    return { deleted: true };
  }
}
