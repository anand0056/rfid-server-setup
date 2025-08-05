export enum ErrorType {
  MQTT_PARSE_ERROR = 'mqtt_parse_error',
  DATABASE_ERROR = 'database_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_READER = 'unknown_reader',
  UNKNOWN_CARD = 'unknown_card',
  GENERAL_ERROR = 'general_error',
}

export interface ErrorLog {
  id: number;
  tenantId: number;
  errorType: ErrorType;
  errorMessage: string;
  rawData: any;
  sourceTopic?: string;
  sourceIp?: string;
  stackTrace?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorLogStats {
  total: number;
  resolved: number;
  unresolved: number;
  byType: Record<ErrorType, number>;
  recentCount: number;
}

export interface ErrorLogQueryParams {
  tenantId?: number;
  errorType?: ErrorType;
  resolved?: boolean;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface ErrorLogResponse {
  data: ErrorLog[];
  total: number;
  page: number;
  totalPages: number;
}
