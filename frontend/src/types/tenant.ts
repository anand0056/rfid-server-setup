export interface Tenant {
  id: number;
  name: string;
  tenant_code: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantStats {
  tenant_name: string;
  total_readers: number;
  online_readers: number;
  offline_readers: number;
  total_cards: number;
  staff_cards: number;
  vehicle_cards: number;
  total_staff: number;
  total_vehicles: number;
}

export interface CreateTenantData {
  name: string;
  tenant_code: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active?: boolean;
}
