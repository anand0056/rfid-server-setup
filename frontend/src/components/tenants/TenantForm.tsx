'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import { Tenant, CreateTenantData } from '../../types/tenant';

interface TenantFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTenantData) => void;
  tenant?: Tenant | null;
  loading?: boolean;
}

export default function TenantForm({
  open,
  onClose,
  onSubmit,
  tenant,
  loading = false
}: TenantFormProps) {
  const [formData, setFormData] = useState<CreateTenantData>({
    name: '',
    tenant_code: '',
    group_id: undefined,
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when tenant prop changes
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        tenant_code: tenant.tenant_code || '',
        group_id: (tenant as any).group_id ?? undefined,
        description: tenant.description || '',
        contact_email: tenant.contact_email || '',
        contact_phone: tenant.contact_phone || '',
        address: tenant.address || '',
        is_active: tenant.is_active ?? true,
      });
    } else {
      // Reset form for new tenant
      setFormData({
        name: '',
        tenant_code: '',
        group_id: undefined,
        description: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        is_active: true,
      });
    }
    // Clear errors when tenant changes
    setErrors({});
  }, [tenant]);

  const handleChange = (field: keyof CreateTenantData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = field === 'is_active' ? (event.target as HTMLInputElement).checked : event.target.value;
    const value: any = field === 'group_id' ? (raw === '' ? undefined : Number(raw)) : raw;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.tenant_code.trim()) {
      newErrors.tenant_code = 'Tenant code is required';
    } else if (!/^[A-Z0-9_]{2,10}$/.test(formData.tenant_code)) {
      newErrors.tenant_code = 'Tenant code must be 2-10 uppercase letters, numbers, or underscores';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (formData.group_id !== undefined && formData.group_id !== null) {
      if (!Number.isInteger(formData.group_id) || formData.group_id <= 0) {
        newErrors.group_id = 'Group ID must be a positive integer';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      tenant_code: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {tenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tenant Code"
                value={formData.tenant_code}
                onChange={handleChange('tenant_code')}
                error={!!errors.tenant_code}
                helperText={errors.tenant_code || 'Unique identifier (e.g., ACME_CORP)'}
                required
                disabled={!!tenant} // Don't allow editing tenant code
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Group ID"
                type="number"
                value={formData.group_id ?? ''}
                onChange={handleChange('group_id')}
                error={!!errors.group_id}
                helperText={errors.group_id || 'Optional external group id used for syncing'}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange('contact_email')}
                error={!!errors.contact_email}
                helperText={errors.contact_email}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contact_phone}
                onChange={handleChange('contact_phone')}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleChange('is_active')}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : (tenant ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
