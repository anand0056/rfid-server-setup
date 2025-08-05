'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import VehicleStats from '../../components/vehicles/VehicleStats';
import VehiclesTable from '../../components/vehicles/VehiclesTable';
import VehicleForm from '../../components/vehicles/VehicleForm';
import { BACKEND_API_URL } from '../../flavours/apiConfig';

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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    license_plate: '',
    vehicle_type: '',
    make: '',
    model: '',
    year: '',
    color: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    registration_date: '',
    insurance_expiry: '',
    notes: '',
    is_active: true,
    tenant_id: 1, // Default tenant ID, will be selected in the form
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching vehicles data...');
      const response = await fetch(`${BACKEND_API_URL}/api/vehicles`);

      console.log('Vehicles response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles data');
      }

      const data = await response.json();
      console.log('Fetched vehicles data:', data);

      setVehicles(data);
      setError(null);
    } catch (err) {
      console.error('Vehicles fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        license_plate: vehicle.license_plate,
        vehicle_type: vehicle.vehicle_type,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        owner_name: vehicle.owner_name || '',
        owner_phone: vehicle.owner_phone || '',
        owner_email: vehicle.owner_email || '',
        registration_date: vehicle.registration_date ? vehicle.registration_date.split('T')[0] : '',
        insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split('T')[0] : '',
        notes: vehicle.notes || '',
        is_active: vehicle.is_active,
        tenant_id: vehicle.tenant_id,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        license_plate: '',
        vehicle_type: '',
        make: '',
        model: '',
        year: '',
        color: '',
        owner_name: '',
        owner_phone: '',
        owner_email: '',
        registration_date: '',
        insurance_expiry: '',
        notes: '',
        is_active: true,
        tenant_id: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVehicle(null);
  };

  const handleFormChange = (field: string, value: string | boolean | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!formData.license_plate.trim()) {
        setError('License plate is required');
        return;
      }

      if (!formData.vehicle_type) {
        setError('Vehicle type is required');
        return;
      }

      if (!formData.make.trim()) {
        setError('Make is required');
        return;
      }

      if (!formData.model.trim()) {
        setError('Model is required');
        return;
      }

      const payload = {
        license_plate: formData.license_plate,
        vehicle_type: formData.vehicle_type,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        owner_name: formData.owner_name || null,
        owner_phone: formData.owner_phone || null,
        owner_email: formData.owner_email || null,
        registration_date: formData.registration_date || null,
        insurance_expiry: formData.insurance_expiry || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
        tenant_id: formData.tenant_id,
      };

      console.log('Submitting vehicle payload:', payload);

      const url = editingVehicle 
        ? `${BACKEND_API_URL}/api/vehicles/${editingVehicle.id}`
        : `${BACKEND_API_URL}/api/vehicles`;
      
      const method = editingVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Vehicle response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vehicle error response:', errorText);
        throw new Error(`Failed to save vehicle: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Vehicle success result:', result);

      await fetchData();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      console.error('Vehicle submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Are you sure you want to delete vehicle ${vehicle.license_plate}?`)) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/vehicles/${vehicle.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      await fetchData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
    }
  };

  const getVehicleStats = () => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.is_active).length;
    const inactiveVehicles = totalVehicles - activeVehicles;
    const vehicleTypes = new Set(vehicles.map(v => v.vehicle_type).filter(Boolean));
    const vehicleTypesCount = vehicleTypes.size;

    return { totalVehicles, activeVehicles, inactiveVehicles, vehicleTypes: vehicleTypesCount };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vehicle Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Vehicle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <VehicleStats stats={getVehicleStats()} />
      <VehiclesTable vehicles={vehicles} onEdit={handleOpenDialog} onDelete={handleDelete} />
      
      <VehicleForm
        open={openDialog}
        editingVehicle={editingVehicle}
        submitting={submitting}
        formData={formData}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />
    </Box>
  );
}
