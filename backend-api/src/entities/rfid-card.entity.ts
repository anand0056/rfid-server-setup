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
import { Staff } from './staff.entity';
import { Vehicle } from './vehicle.entity';

@Entity('rfid_cards')
export class RfidCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenant_id: number;

  @Column({ unique: true, length: 50 })
  card_uid: string;

  @Column({
    type: 'enum',
    enum: ['staff', 'vehicle', 'visitor', 'guest'],
  })
  card_type: 'staff' | 'vehicle' | 'visitor' | 'guest';

  @Column({ nullable: true })
  staff_id: number | null;

  @Column({ nullable: true })
  vehicle_id: number | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: true })
  issued_at: Date;

  @Column({ type: 'datetime', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.cards)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Staff, (staff) => staff.rfid_cards, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.rfid_cards, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}
