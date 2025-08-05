import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
} from '@mui/material';
import { useState, useEffect } from 'react';

interface Tenant {
  id: number;
  name: string;
  tenant_code: string;
}

interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  tenant_id: number;
  created_at: string;
  updated_at: string;
}

interface StaffFormProps {
  open: boolean;
  editingStaff: Staff | null;
  submitting?: boolean;
  formData: {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    hire_date: string;
    is_active: boolean;
    tenant_id: number;
  };
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (field: string, value: string | boolean | number) => void;
}

export default function StaffForm({
  open,
  editingStaff,
  submitting = false,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}: StaffFormProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/tenants');
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result; // Handle both wrapped and unwrapped responses
          setTenants(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch tenants:', response.statusText);
          setTenants([]);
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
        setTenants([]);
      }
    };

    if (open) {
      fetchTenants();
    }
  }, [open]);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <input type="hidden" value={formData.employee_id} name="employee_id" />
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employee_id}
                onChange={(e) => onFormChange('employee_id', e.target.value)}
                disabled={!!editingStaff}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={formData.tenant_id}
                  label="Tenant"
                  onChange={(e) => onFormChange('tenant_id', e.target.value as number)}
                >
                  {(tenants || []).map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.tenant_code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.is_active ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) => onFormChange('is_active', e.target.value === 'active')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => onFormChange('first_name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => onFormChange('last_name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => onFormChange('department', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => onFormChange('position', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => onFormChange('hire_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : (editingStaff ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
