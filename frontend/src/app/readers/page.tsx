'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Router,
  CheckCircle,
  Cancel,
  LocationOn,
} from '@mui/icons-material';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { BACKEND_API_URL } from '../../flavours/apiConfig';

interface RfidReader {
  id: number;
  reader_id: string;
  name: string;
  location: string;
  status?: 'online' | 'offline' | 'maintenance';
  is_online?: boolean;
  reader_group_id: number | null;
  tenant_id: number;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
  reader_group?: {
    id: number;
    name: string;
    description: string;
  };
}

interface ReaderGroup {
  id: number;
  name: string;
  description: string;
}

export default function ReadersPage() {
  const [readers, setReaders] = useState<RfidReader[]>([]);
  const [readerGroups, setReaderGroups] = useState<ReaderGroup[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReader, setEditingReader] = useState<RfidReader | null>(null);
  const [formData, setFormData] = useState({
    reader_id: '',
    name: '',
    location: '',
    status: 'offline' as 'online' | 'offline' | 'maintenance',
    reader_group_id: '',
    tenant_id: 1, // Default tenant ID, will be selected in the form
  });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [readerToDelete, setReaderToDelete] = useState<RfidReader | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const readersRes = await fetch(`${BACKEND_API_URL}/api/rfid/readers`);
      const groupsRes = await fetch(`${BACKEND_API_URL}/api/reader-groups`);
      const tenantsRes = await fetch(`${BACKEND_API_URL}/api/tenants`);

      if (!readersRes.ok) {
        throw new Error('Failed to fetch readers');
      }

      if (!tenantsRes.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const readersData = await readersRes.json();
      const tenantsData = await tenantsRes.json();
      
      // Handle wrapped response for readers
      const readers = Array.isArray(readersData) ? readersData : (readersData.data || []);
      
      // Transform is_online to status for display
      const transformedReaders = readers.map((reader: any) => ({
        ...reader,
        status: reader.is_online ? 'online' : 'offline'
      }));
      
      setReaders(transformedReaders);
      
      // Handle wrapped response for tenants
      const tenants = tenantsData.data || tenantsData;
      setTenants(Array.isArray(tenants) ? tenants : []);

      // Handle reader groups - might not exist yet
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setReaderGroups(groupsData);
      } else {
        // Create a default group for demo purposes
        setReaderGroups([
          { id: 1, name: 'Main Entrance', description: 'Main building entrance readers' },
          { id: 2, name: 'Parking', description: 'Parking area readers' },
          { id: 3, name: 'Internal Doors', description: 'Internal office doors' },
        ]);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (reader?: RfidReader) => {
    if (reader) {
      setEditingReader(reader);
      setFormData({
        reader_id: reader.reader_id,
        name: reader.name,
        location: reader.location || '',
        status: reader.status || (reader.is_online ? 'online' : 'offline'),
        reader_group_id: reader.reader_group_id?.toString() || '',
        tenant_id: reader.tenant_id,
      });
    } else {
      setEditingReader(null);
      setFormData({
        reader_id: '',
        name: '',
        location: '',
        status: 'offline',
        reader_group_id: '',
        tenant_id: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReader(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.reader_id.trim()) {
        setError('Reader ID is required');
        return;
      }

      if (!formData.name.trim()) {
        setError('Reader name is required');
        return;
      }

      // Map status to is_online for API
      const payload = {
        reader_id: formData.reader_id,
        name: formData.name,
        location: formData.location || null,
        is_online: formData.status === 'online', // Convert status to is_online boolean
        reader_group_id: formData.reader_group_id ? +formData.reader_group_id : null,
        tenant_id: formData.tenant_id,
      };

      console.log('Submitting reader payload:', payload);

      // Use the appropriate URL and method based on whether we're editing or creating
      const url = editingReader 
        ? `${BACKEND_API_URL}/api/rfid/readers/${editingReader.id}`
        : `${BACKEND_API_URL}/api/rfid/readers`;
      
      const method = editingReader ? 'PUT' : 'POST';

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = `HTTP error ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            try {
              errorMessage = await response.text();
            } catch (textError) {
              // If we can't get text, use the HTTP status
            }
          }
          console.error('Error response:', errorMessage);
          throw new Error(`Failed to save reader: ${errorMessage}`);
        }

        const data = await response.json();
        console.log('Reader created/updated successfully:', data);
        
        setToast({
          open: true,
          message: `Reader ${editingReader ? 'updated' : 'created'} successfully!`,
          severity: 'success',
        });
        
        await fetchData();
        handleCloseDialog();
        setError(null);
      } catch (responseError) {
        console.error('Response error:', responseError);
        throw responseError;
      }
    } catch (err) {
      console.error('Submit error:', err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to save reader',
        severity: 'error',
      });
      setError(err instanceof Error ? err.message : 'Failed to save reader');
    }
  };

  const handleDelete = (reader: RfidReader) => {
    setReaderToDelete(reader);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!readerToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`${BACKEND_API_URL}/api/rfid/readers/${readerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete reader: ${errorText}`);
      }

      await fetchData();
      setToast({ open: true, message: `Reader ${readerToDelete.name} deleted successfully!`, severity: 'success' });
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ open: true, message: err instanceof Error ? err.message : 'Failed to delete reader', severity: 'error' });
    } finally {
      setDeleting(false);
      setOpenConfirmDialog(false);
      setReaderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
    setReaderToDelete(null);
  };

  const getReaderStats = () => {
    const totalReaders = readers.length;
    const onlineReaders = readers.filter(reader => reader.status === 'online').length;
    const offlineReaders = readers.filter(reader => reader.status === 'offline').length;
    const maintenanceReaders = readers.filter(reader => reader.status === 'maintenance').length;

    return { totalReaders, onlineReaders, offlineReaders, maintenanceReaders };
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle color="success" />;
      case 'offline': return <Cancel color="error" />;
      case 'maintenance': return <LocationOn color="warning" />;
      default: return null;
    }
  };

  const stats = getReaderStats();

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
          RFID Readers Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Reader
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Router color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.totalReaders}</Typography>
              <Typography color="text.secondary">Total Readers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">{stats.onlineReaders}</Typography>
              <Typography color="text.secondary">Online</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">{stats.offlineReaders}</Typography>
              <Typography color="text.secondary">Offline</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocationOn color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">{stats.maintenanceReaders}</Typography>
              <Typography color="text.secondary">Maintenance</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Readers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All RFID Readers
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reader ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reader Group</TableCell>
                  <TableCell>Last Heartbeat</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readers.map((reader) => (
                  <TableRow key={reader.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {reader.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(reader.status || (reader.is_online ? 'online' : 'offline'))}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {reader.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{reader.location}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={reader.status}
                        color={getStatusColor(reader.status || (reader.is_online ? 'online' : 'offline'))}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {reader.reader_group?.name || 'N/A'}
                      </Typography>
                      {reader.reader_group?.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {reader.reader_group.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {reader.last_heartbeat 
                          ? new Date(reader.last_heartbeat).toLocaleString()
                          : 'Never'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(reader)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(reader)}>
                        <Cancel />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(reader)}>
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {readers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No readers found. Add your first reader to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReader ? 'Edit RFID Reader' : 'Add New RFID Reader'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Reader ID"
                  value={formData.reader_id}
                  onChange={(e) => setFormData({ ...formData, reader_id: e.target.value })}
                  disabled={!!editingReader}
                  helperText="Unique identifier for the reader"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Reader Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Location (Optional)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  helperText="Physical location of the reader (optional)"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'online' | 'offline' | 'maintenance' })}
                  >
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Reader Group (Optional)</InputLabel>
                  <Select
                    value={formData.reader_group_id}
                    label="Reader Group (Optional)"
                    onChange={(e) => setFormData({ ...formData, reader_group_id: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {readerGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    value={formData.tenant_id}
                    label="Tenant"
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value as number })}
                  >
                    {(tenants || []).map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.tenant_code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReader ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        title="Delete Reader"
        message={`Are you sure you want to delete reader ${readerToDelete?.name || ''}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleting}
      />

      {/* Toast for notifications */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
