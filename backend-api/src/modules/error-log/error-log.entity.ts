import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';

export enum ErrorType {
  MQTT_PARSE_ERROR = 'mqtt_parse_error',
  DATABASE_ERROR = 'database_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_READER = 'unknown_reader',
  UNKNOWN_CARD = 'unknown_card',
  GENERAL_ERROR = 'general_error',
}

@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id', default: 1 })
  tenantId: number;

  @Column({
    type: 'enum',
    enum: ErrorType,
    name: 'error_type',
  })
  errorType: ErrorType;

  @Column({ type: 'text', name: 'error_message' })
  errorMessage: string;

  @Column({ type: 'json', nullable: true, name: 'raw_data' })
  rawData: any;

  @Column({ length: 200, nullable: true, name: 'source_topic' })
  sourceTopic: string;

  @Column({ length: 50, nullable: true, name: 'source_ip' })
  sourceIp: string;

  @Column({ type: 'text', nullable: true, name: 'stack_trace' })
  stackTrace: string;

  @Column({ default: false })
  resolved: boolean;

  @Column({ length: 100, nullable: true, name: 'resolved_by' })
  resolvedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'resolved_at' })
  resolvedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'resolution_notes' })
  resolutionNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
