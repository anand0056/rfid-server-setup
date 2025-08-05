'use client';

import { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { MoreVert, Edit, Delete, Info } from '@mui/icons-material';
import { Tenant } from '../../types/tenant';

interface TenantsTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onViewDetails: (tenant: Tenant) => void;
}

export default function TenantsTable({ 
  tenants, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: TenantsTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tenant: Tenant) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTenant(null);
  };

  const handleMenuAction = (action: 'edit' | 'delete' | 'details') => {
    if (!selectedTenant) return;
    
    switch (action) {
      case 'edit':
        onEdit(selectedTenant);
        break;
      case 'delete':
        onDelete(selectedTenant);
        break;
      case 'details':
        onViewDetails(selectedTenant);
        break;
    }
    handleMenuClose();
  };

  if (tenants.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No tenants found. Click "Add Tenant" to create your first tenant.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Tenant Code</TableCell>
            <TableCell>Contact Email</TableCell>
            <TableCell>Contact Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {tenant.name}
                  </Typography>
                  {tenant.description && (
                    <Typography variant="caption" color="text.secondary">
                      {tenant.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {tenant.tenant_code}
                </Typography>
              </TableCell>
              <TableCell>
                {tenant.contact_email || '-'}
              </TableCell>
              <TableCell>
                {tenant.contact_phone || '-'}
              </TableCell>
              <TableCell>
                <Chip
                  label={tenant.is_active ? 'Active' : 'Inactive'}
                  color={tenant.is_active ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(tenant.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, tenant)}
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('details')}>
          <Info sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => handleMenuAction('delete')}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}
