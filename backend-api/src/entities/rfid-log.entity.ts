import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { RfidCard } from './rfid-card.entity';
import { RfidReader } from './rfid-reader.entity';

@Entity('rfid_logs')
export class RfidLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenant_id: number;

  @Column({ length: 50 })
  card_uid: string;

  @Column({ length: 50 })
  reader_id: string;

  @Column({ length: 50, default: 'scan' })
  event_type: string; // 'scan', 'entry', 'exit', 'denied'

  @Column({ type: 'text', nullable: true })
  raw_data: string;

  @Column({ default: true })
  is_authorized: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  timestamp: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.logs)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => RfidCard, { nullable: true })
  @JoinColumn({ name: 'card_uid', referencedColumnName: 'card_uid' })
  card: RfidCard;

  @ManyToOne(() => RfidReader, { nullable: true })
  @JoinColumn({ name: 'reader_id', referencedColumnName: 'reader_id' })
  reader: RfidReader;
}
