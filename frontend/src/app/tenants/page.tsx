'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import TenantStats from '../../components/tenants/TenantStats';
import TenantsTable from '../../components/tenants/TenantsTable';
import TenantForm from '../../components/tenants/TenantForm';
import { Tenant, CreateTenantData } from '../../types/tenant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchTenants = async () => {
    try {
      const [tenantsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tenants`),
        axios.get(`${API_BASE_URL}/api/tenants/stats`),
      ]);

      setTenants(tenantsResponse.data.data || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      showSnackbar('Failed to fetch tenants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setFormOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (tenant: Tenant) => {
    // For now, just show an alert with tenant details
    // In a real app, you might navigate to a detailed view
    alert(`Tenant Details:\nName: ${tenant.name}\nCode: ${tenant.tenant_code}\nEmail: ${tenant.contact_email || 'N/A'}`);
  };

  const handleFormSubmit = async (data: CreateTenantData) => {
    try {
      if (selectedTenant) {
        // Update existing tenant
        const response = await axios.put(
          `${API_BASE_URL}/api/tenants/${selectedTenant.id}`,
          data
        );
        showSnackbar('Tenant updated successfully', 'success');
      } else {
        // Create new tenant
        const response = await axios.post(`${API_BASE_URL}/api/tenants`, data);
        showSnackbar('Tenant created successfully', 'success');
      }
      
      setFormOpen(false);
      setSelectedTenant(null);
      fetchTenants(); // Refresh the list
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      const message = error.response?.data?.message || 'Failed to save tenant';
      showSnackbar(message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!tenantToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/tenants/${tenantToDelete.id}`);
      showSnackbar('Tenant deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      fetchTenants(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      const message = error.response?.data?.message || 'Failed to delete tenant';
      showSnackbar(message, 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading tenants...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Tenants Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTenant}
        >
          Add Tenant
        </Button>
      </Box>

      <TenantStats stats={stats} />

      <TenantsTable
        tenants={tenants}
        onEdit={handleEditTenant}
        onDelete={handleDeleteTenant}
        onViewDetails={handleViewDetails}
      />

      <TenantForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedTenant(null);
        }}
        onSubmit={handleFormSubmit}
        tenant={selectedTenant}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete tenant "{tenantToDelete?.name}"? 
          This will deactivate the tenant and all associated data.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
