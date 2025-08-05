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

interface RfidCard {
  uid: string;
  card_type: 'staff' | 'vehicle';
  is_active: boolean;
  assigned_staff_id: number | null;
  assigned_vehicle_id: number | null;
}

interface Staff {
  id: number;
  name: string;
  employee_id: string;
}

interface Vehicle {
  id: number;
  license_plate: string;
  make: string;
  model: string;
}

interface CardFormProps {
  open: boolean;
  editingCard: RfidCard | null;
  staff: Staff[];
  vehicles: Vehicle[];
  submitting?: boolean;
  formData: {
    uid: string;
    card_type: 'staff' | 'vehicle';
    is_active: boolean;
    assigned_staff_id: string;
    assigned_vehicle_id: string;
    tenant_id: number;
  };
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (field: string, value: string | boolean | number) => void;
}

export default function CardForm({
  open,
  editingCard,
  staff,
  vehicles,
  submitting = false,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}: CardFormProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        console.log('Fetching tenants for CardForm...');
        const response = await fetch('/api/tenants');
        console.log('Tenant response status:', response.status);
        console.log('Tenant response OK:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Raw tenant response:', result);
          
          // Handle the wrapped response structure
          const tenantData = result.data || result;
          console.log('Extracted tenant data:', tenantData);
          
          setTenants(Array.isArray(tenantData) ? tenantData : []);
          console.log('Tenants loaded for card form:', Array.isArray(tenantData) ? tenantData : []);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingCard ? 'Edit RFID Card' : 'Add New RFID Card'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Card UID"
                value={formData.uid}
                onChange={(e) => onFormChange('uid', e.target.value)}
                disabled={!!editingCard}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Card Type</InputLabel>
                <Select
                  value={formData.card_type}
                  label="Card Type"
                  onChange={(e) => onFormChange('card_type', e.target.value)}
                >
                  <MenuItem value="staff">Staff Card</MenuItem>
                  <MenuItem value="vehicle">Vehicle Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
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
            {formData.card_type === 'staff' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Assign to Staff</InputLabel>
                  <Select
                    value={formData.assigned_staff_id}
                    label="Assign to Staff"
                    onChange={(e) => onFormChange('assigned_staff_id', e.target.value)}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {staff.map((member) => (
                      <MenuItem key={member.id} value={member.id.toString()}>
                        {member.name} (ID: {member.employee_id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {formData.card_type === 'vehicle' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Assign to Vehicle</InputLabel>
                  <Select
                    value={formData.assigned_vehicle_id}
                    label="Assign to Vehicle"
                    onChange={(e) => onFormChange('assigned_vehicle_id', e.target.value)}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.license_plate} ({vehicle.make} {vehicle.model})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
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
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : (editingCard ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
