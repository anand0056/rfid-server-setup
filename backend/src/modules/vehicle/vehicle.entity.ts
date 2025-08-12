import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { RfidCard } from '../rfid-card/rfid-card.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenant_id: number;

  @Column({ unique: true, length: 20 })
  license_plate: string;

  @Column({ length: 50, nullable: true })
  vehicle_type: string; // 'car', 'truck', 'motorcycle', 'bus', 'van'

  @Column({ length: 50, nullable: true })
  make: string; // Toyota, Honda, etc.

  @Column({ length: 50, nullable: true })
  model: string;

  @Column({ length: 10, nullable: true })
  year: string;

  @Column({ length: 30, nullable: true })
  color: string;

  @Column({ length: 100, nullable: true })
  owner_name: string;

  @Column({ length: 15, nullable: true })
  owner_phone: string;

  @Column({ length: 100, nullable: true })
  owner_email: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'date', nullable: true })
  registration_date: Date;

  @Column({ type: 'date', nullable: true })
  insurance_expiry: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.vehicles)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => RfidCard, (card) => card.vehicle)
  rfid_cards: RfidCard[];
}
