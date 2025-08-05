import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { RfidReaderGroup } from './rfid-reader-group.entity';

@Entity('rfid_readers')
export class RfidReader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenant_id: number;

  @Column({ nullable: true })
  reader_group_id: number;

  @Column({ unique: true, length: 50 })
  reader_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 50, nullable: true })
  ip_address: string;

  @Column({ length: 50, nullable: true })
  mac_address: string;

  @Column({ default: true })
  is_online: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_heartbeat: Date;

  @Column({ type: 'text', nullable: true })
  configuration: string; // JSON string for reader-specific config

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.readers)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => RfidReaderGroup, (group) => group.readers)
  @JoinColumn({ name: 'reader_group_id' })
  reader_group: RfidReaderGroup;
}
