'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Business, CheckCircle, Cancel } from '@mui/icons-material';
import { useTenant } from '../contexts/TenantContext';

const TenantSelector: React.FC = () => {
  const { currentTenant, tenants, setCurrentTenant, loading, error } = useTenant();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading tenants...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minWidth: 200 }}>
        <Alert severity="error" sx={{ py: 0.5 }}>
          Error loading tenants
        </Alert>
      </Box>
    );
  }

  if (tenants.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <Business color="disabled" />
        <Typography variant="body2" color="text.secondary">
          No tenants available
        </Typography>
      </Box>
    );
  }

  const handleTenantChange = (tenantId: number) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setCurrentTenant(selectedTenant);
    }
  };

  return (
    <Box sx={{ minWidth: 250 }}>
      <FormControl fullWidth size="small" variant="outlined">
        <InputLabel id="tenant-select-label">Select Tenant</InputLabel>
        <Select
          labelId="tenant-select-label"
          value={currentTenant?.id || ''}
          onChange={(e) => handleTenantChange(e.target.value as number)}
          label="Select Tenant"
          startAdornment={<Business sx={{ mr: 1, color: 'text.secondary' }} />}
        >
          {tenants.map((tenant) => (
            <MenuItem key={tenant.id} value={tenant.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {tenant.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tenant.tenant_code}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  icon={tenant.is_active ? <CheckCircle /> : <Cancel />}
                  label={tenant.is_active ? 'Active' : 'Inactive'}
                  color={tenant.is_active ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {currentTenant && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Current: {currentTenant.name} ({currentTenant.tenant_code})
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TenantSelector;
