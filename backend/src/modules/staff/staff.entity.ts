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

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenant_id: number;

  @Column({ unique: true, length: 50 })
  employee_id: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 100, nullable: true })
  emergency_contact_name: string;

  @Column({ length: 20, nullable: true })
  emergency_contact_phone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.staff)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => RfidCard, (card) => card.staff)
  rfid_cards: RfidCard[];
}
