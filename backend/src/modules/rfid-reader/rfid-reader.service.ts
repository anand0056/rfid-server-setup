import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidReader } from './rfid-reader.entity';

@Injectable()
export class RfidReaderService {
  constructor(
    @InjectRepository(RfidReader)
    private readerRepository: Repository<RfidReader>,
  ) {}

  async getReaders(tenantId?: number, onlineOnly?: boolean) {
    const query = this.readerRepository
      .createQueryBuilder('reader')
      .leftJoinAndSelect('reader.tenant', 'tenant');

    if (tenantId) {
      query.where('reader.tenant_id = :tenantId', { tenantId });
    }

    if (onlineOnly) {
      query.andWhere('reader.is_online = :isOnline', { isOnline: true });
    }

    return query
      .orderBy('reader.tenant_id', 'ASC')
      .addOrderBy('reader.name', 'ASC')
      .getMany();
  }

  async getReaderById(id: number) {
    return this.readerRepository.findOne({ where: { id } });
  }

  async createReader(reader: Partial<RfidReader>) {
    try {
      console.log(
        'Service: Creating reader with data:',
        JSON.stringify(reader, null, 2),
      );

      // If reader_group_id is provided, verify it exists
      if (
        reader.reader_group_id !== null &&
        reader.reader_group_id !== undefined
      ) {
        const groupExists = await this.readerRepository.manager
          .getRepository('rfid_reader_groups')
          .createQueryBuilder('group')
          .where('group.id = :id', { id: reader.reader_group_id })
          .getOne();

        if (!groupExists) {
          console.error(
            `Reader group with ID ${reader.reader_group_id} does not exist`,
          );
          // Force it to undefined if it doesn't exist (will be set to NULL in DB)
          delete reader.reader_group_id;
        }
      }

      const newReader = this.readerRepository.create(reader);
      console.log(
        'Service: Created reader entity:',
        JSON.stringify(newReader, null, 2),
      );
      return await this.readerRepository.save(newReader);
    } catch (error) {
      console.error('Service: Error creating reader:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Referenced reader group does not exist');
      }
      throw error;
    }
  }

  async updateReader(id: number, update: Partial<RfidReader>) {
    try {
      // If reader_group_id is provided, verify it exists
      if (
        update.reader_group_id !== null &&
        update.reader_group_id !== undefined
      ) {
        const groupExists = await this.readerRepository.manager
          .getRepository('rfid_reader_groups')
          .createQueryBuilder('group')
          .where('group.id = :id', { id: update.reader_group_id })
          .getOne();

        if (!groupExists) {
          console.error(
            `Reader group with ID ${update.reader_group_id} does not exist`,
          );
          // Force it to undefined if it doesn't exist (will be set to NULL in DB)
          delete update.reader_group_id;
        }
      }

      await this.readerRepository.update(id, update);
      return this.readerRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Service: Error updating reader:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Referenced reader group does not exist');
      }
      throw error;
    }
  }

  async deleteReader(id: number) {
    await this.readerRepository.delete(id);
    return { deleted: true };
  }
}
