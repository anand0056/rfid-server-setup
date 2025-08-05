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
import StaffStats from '../../components/staff/StaffStats';
import StaffTable from '../../components/staff/StaffTable';
import StaffForm from '../../components/staff/StaffForm';
import { BACKEND_API_URL } from '../../flavours/apiConfig';

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

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hire_date: '',
    is_active: true,
    tenant_id: 1, // Default tenant ID, will be selected in the form
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching staff data...');
      // Use backend URL for API calls
      const [staffResponse, tenantsResponse] = await Promise.all([
        fetch(`${BACKEND_API_URL}/api/staff`),
        fetch(`${BACKEND_API_URL}/api/tenants`)
      ]);

      console.log('Staff response status:', staffResponse.status);

      if (!staffResponse.ok) {
        throw new Error('Failed to fetch staff data');
      }

      if (!tenantsResponse.ok) {
        throw new Error('Failed to fetch tenants data');
      }

      const staffData = await staffResponse.json();
      const tenantsData = await tenantsResponse.json();
      
      console.log('Fetched staff data:', staffData);
      console.log('Fetched tenants data:', tenantsData);

      setStaff(staffData);
      // Handle wrapped response for tenants
      const tenants = tenantsData.data || tenantsData;
      setTenants(Array.isArray(tenants) ? tenants : []);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        employee_id: staffMember.employee_id,
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        department: staffMember.department || '',
        position: staffMember.position || '',
        hire_date: staffMember.hire_date ? staffMember.hire_date.split('T')[0] : '',
        is_active: staffMember.is_active,
        tenant_id: staffMember.tenant_id,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        hire_date: '',
        is_active: true,
        tenant_id: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStaff(null);
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
      if (!formData.employee_id.trim()) {
        setError('Employee ID is required');
        return;
      }

      if (!formData.first_name.trim()) {
        setError('First name is required');
        return;
      }

      const payload = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        department: formData.department || null,
        position: formData.position || null,
        hire_date: formData.hire_date || null,
        is_active: formData.is_active,
        tenant_id: formData.tenant_id,
      };

      console.log('Submitting staff payload:', payload);

      const url = editingStaff 
        ? `${BACKEND_API_URL}/api/staff/${editingStaff.id}`
        : `${BACKEND_API_URL}/api/staff`;
      
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Staff response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Staff error response:', errorText);
        throw new Error(`Failed to save staff: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Staff success result:', result);

      await fetchData();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      console.error('Staff submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffMember: Staff) => {
    if (!confirm(`Are you sure you want to deactivate ${staffMember.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/staff/${staffMember.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }

      await fetchData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete staff member');
    }
  };

  const getStaffStats = () => {
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.is_active).length;
    const inactiveStaff = totalStaff - activeStaff;
    const departments = new Set(staff.map(s => s.department).filter(Boolean));
    const departmentCount = departments.size;

    return { totalStaff, activeStaff, inactiveStaff, departmentCount };
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
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Staff
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <StaffStats stats={getStaffStats()} />
      <StaffTable staff={staff} onEdit={handleOpenDialog} onDelete={handleDelete} />
      
      <StaffForm
        open={openDialog}
        editingStaff={editingStaff}
        submitting={submitting}
        formData={formData}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />
    </Box>
  );
}
