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

interface Vehicle {
  id: number;
  license_plate: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: string;
  color: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  is_active: boolean;
  registration_date?: string;
  insurance_expiry?: string;
  notes?: string;
  tenant_id: number;
  created_at: string;
  updated_at: string;
}

interface VehicleFormProps {
  open: boolean;
  editingVehicle: Vehicle | null;
  submitting?: boolean;
  formData: {
    license_plate: string;
    vehicle_type: string;
    make: string;
    model: string;
    year: string;
    color: string;
    owner_name: string;
    owner_phone: string;
    owner_email: string;
    registration_date: string;
    insurance_expiry: string;
    notes: string;
    is_active: boolean;
    tenant_id: number;
  };
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (field: string, value: string | boolean | number) => void;
}

const vehicleTypes = ['Car', 'Truck', 'Van', 'SUV', 'Motorcycle', 'Bus', 'Other'];
const colors = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Other'];

export default function VehicleForm({
  open,
  editingVehicle,
  submitting = false,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}: VehicleFormProps) {
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
        {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="License Plate"
                value={formData.license_plate}
                onChange={(e) => onFormChange('license_plate', e.target.value)}
                disabled={!!editingVehicle}
                required
              />
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
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicle_type}
                  label="Vehicle Type"
                  onChange={(e) => onFormChange('vehicle_type', e.target.value)}
                  required
                >
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Year"
                value={formData.year}
                onChange={(e) => onFormChange('year', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Make"
                value={formData.make}
                onChange={(e) => onFormChange('make', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => onFormChange('model', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.color}
                  label="Color"
                  onChange={(e) => onFormChange('color', e.target.value)}
                  required
                >
                  {colors.map((color) => (
                    <MenuItem key={color} value={color}>{color}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Owner Name"
                value={formData.owner_name}
                onChange={(e) => onFormChange('owner_name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Owner Phone"
                value={formData.owner_phone}
                onChange={(e) => onFormChange('owner_phone', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Owner Email"
                type="email"
                value={formData.owner_email}
                onChange={(e) => onFormChange('owner_email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Registration Date"
                type="date"
                value={formData.registration_date}
                onChange={(e) => onFormChange('registration_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Insurance Expiry"
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => onFormChange('insurance_expiry', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => onFormChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : (editingVehicle ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
