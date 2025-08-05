'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Tenant {
  id: number;
  tenant_code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  setCurrentTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  error: string | null;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use /api for frontend-side API routing
      const response = await fetch('/api/tenants');
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }
      
      const data = await response.json();
      const tenantsData = data.data || data || [];
      setTenants(tenantsData);
      
      // If no current tenant is selected, select the first active tenant
      if (!currentTenant && tenantsData.length > 0) {
        const firstActiveTenant = tenantsData.find((t: Tenant) => t.is_active) || tenantsData[0];
        setCurrentTenant(firstActiveTenant);
        // Store in localStorage for persistence
        localStorage.setItem('selectedTenant', JSON.stringify(firstActiveTenant));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenant(tenant);
    if (tenant) {
      localStorage.setItem('selectedTenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('selectedTenant');
    }
  };

  useEffect(() => {
    // Try to restore selected tenant from localStorage
    const savedTenant = localStorage.getItem('selectedTenant');
    if (savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant);
        setCurrentTenant(tenant);
      } catch (err) {
        console.error('Error parsing saved tenant:', err);
        localStorage.removeItem('selectedTenant');
      }
    }
    
    // Fetch tenants
    refreshTenants();
  }, []);

  const value: TenantContextType = {
    currentTenant,
    tenants,
    setCurrentTenant: handleSetCurrentTenant,
    loading,
    error,
    refreshTenants,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
