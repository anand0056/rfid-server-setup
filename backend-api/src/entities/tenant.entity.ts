import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RfidReader } from './rfid-reader.entity';
import { RfidReaderGroup } from './rfid-reader-group.entity';
import { RfidCard } from './rfid-card.entity';
import { RfidLog } from './rfid-log.entity';
import { Staff } from './staff.entity';
import { Vehicle } from './vehicle.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  tenant_code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  contact_email: string;

  @Column({ length: 20, nullable: true })
  contact_phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 50, default: 'basic' })
  subscription_plan: string;

  @Column({ default: 10 })
  max_readers: number;

  @Column({ default: 1000 })
  max_cards: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => RfidReader, (reader) => reader.tenant)
  readers: RfidReader[];

  @OneToMany(() => RfidReaderGroup, (group) => group.tenant)
  reader_groups: RfidReaderGroup[];

  @OneToMany(() => RfidCard, (card) => card.tenant)
  cards: RfidCard[];

  @OneToMany(() => RfidLog, (log) => log.tenant)
  logs: RfidLog[];

  @OneToMany(() => Staff, (staff) => staff.tenant)
  staff: Staff[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.tenant)
  vehicles: Vehicle[];
}
