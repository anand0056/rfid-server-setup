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
import CardStats from '../../components/cards/CardStats';
import CardsTable from '../../components/cards/CardsTable';
import CardForm from '../../components/cards/CardForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

interface RfidCard {
  uid: string;
  card_uid: string; // Backend also includes this
  card_type: 'staff' | 'vehicle';
  is_active: boolean;
  assigned_to?: string | null;
  assigned_staff_id: number | null;
  assigned_vehicle_id: number | null;
  staff_id: number | null; // Backend field
  vehicle_id: number | null; // Backend field
  tenant_id: number;
  created_at: string;
  updated_at: string;
  staff?: {
    id: number;
    name: string;
    employee_id: string;
  };
  vehicle?: {
    id: number;
    license_plate: string;
    make: string;
    model: string;
  };
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

export default function CardsPage() {
  const [cards, setCards] = useState<RfidCard[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<RfidCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [editingCard, setEditingCard] = useState<RfidCard | null>(null);
  const [formData, setFormData] = useState({
    uid: '',
    card_type: 'staff' as 'staff' | 'vehicle',
    is_active: true,
    assigned_staff_id: '',
    assigned_vehicle_id: '',
    tenant_id: 1, // Default tenant ID, will be selected in the form
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      const [cardsRes, staffRes, vehiclesRes] = await Promise.all([
        fetch(`/api/rfid/cards`),
        fetch(`/api/staff`),
        fetch(`/api/vehicles`),
      ]);

      console.log('Response statuses:', {
        cards: cardsRes.status,
        staff: staffRes.status,
        vehicles: vehiclesRes.status,
      });

      if (!cardsRes.ok || !staffRes.ok || !vehiclesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [cardsData, staffData, vehiclesData] = await Promise.all([
        cardsRes.json(),
        staffRes.json(),
        vehiclesRes.json(),
      ]);

      console.log('Fetched data:', { cardsData, staffData, vehiclesData });

      setCards(cardsData);
      setStaff(staffData);
      setVehicles(vehiclesData);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (card?: RfidCard) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        uid: card.uid,
        card_type: card.card_type,
        is_active: card.is_active,
        assigned_staff_id: card.assigned_staff_id?.toString() || '',
        assigned_vehicle_id: card.assigned_vehicle_id?.toString() || '',
        tenant_id: card.tenant_id,
      });
    } else {
      setEditingCard(null);
      setFormData({
        uid: '',
        card_type: 'staff',
        is_active: true,
        assigned_staff_id: '',
        assigned_vehicle_id: '',
        tenant_id: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCard(null);
  };

  const handleFormChange = (field: string, value: string | boolean | number) => {
    if (field === 'card_type') {
      setFormData({
        ...formData,
        card_type: value as 'staff' | 'vehicle',
        assigned_staff_id: '',
        assigned_vehicle_id: '',
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!formData.uid.trim()) {
        setError('Card UID is required');
        return;
      }

      if (!formData.card_type) {
        setError('Card type is required');
        return;
      }

      const payload = {
        uid: formData.uid,
        card_type: formData.card_type,
        is_active: formData.is_active,
        tenant_id: formData.tenant_id,
        assigned_staff_id: formData.card_type === 'staff' && formData.assigned_staff_id ? +formData.assigned_staff_id : null,
        assigned_vehicle_id: formData.card_type === 'vehicle' && formData.assigned_vehicle_id ? +formData.assigned_vehicle_id : null,
      };

      console.log('Submitting card payload:', payload);

      const url = editingCard 
        ? `/api/rfid/cards/${editingCard.uid}`
        : `/api/rfid/cards`;
      
      const method = editingCard ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to save card: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Success result:', result);

      await fetchData();
      handleCloseDialog();
      setError(null);
      setToast({ open: true, message: `Card ${editingCard ? 'updated' : 'created'} successfully!`, severity: 'success' });
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (card: RfidCard) => {
    setCardToDelete(card);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/rfid/cards/${cardToDelete.uid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      await fetchData();
      setToast({ open: true, message: `Card ${cardToDelete.uid} deleted successfully!`, severity: 'success' });
      setError(null);
    } catch (err) {
      setToast({ open: true, message: err instanceof Error ? err.message : 'Failed to delete card', severity: 'error' });
    } finally {
      setDeleting(false);
      setOpenConfirmDialog(false);
      setCardToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
    setCardToDelete(null);
  };

  const getCardStats = () => {
    const totalCards = cards.length;
    const activeCards = cards.filter(card => card.is_active).length;
    const staffCards = cards.filter(card => card.card_type === 'staff').length;
    const vehicleCards = cards.filter(card => card.card_type === 'vehicle').length;
    const assignedCards = cards.filter(card => card.assigned_to).length;

    return { totalCards, activeCards, staffCards, vehicleCards, assignedCards };
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
          RFID Cards Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={async () => {
              try {
                const testPayload = {
                  uid: `TEST_${Date.now()}`,
                  card_type: 'staff',
                  is_active: true,
                  tenant_id: 1,
                  assigned_staff_id: 1,
                };
                console.log('Direct test payload:', testPayload);
                const response = await fetch('/api/rfid/cards', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(testPayload),
                });
                if (response.ok) {
                  const result = await response.json();
                  console.log('Direct test success:', result);
                  await fetchData();
                } else {
                  console.error('Direct test failed:', response.status, await response.text());
                }
              } catch (err) {
                console.error('Direct test error:', err);
              }
            }}
          >
            Test Direct Create
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Card
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CardStats stats={getCardStats()} />
      <CardsTable cards={cards} onEdit={handleOpenDialog} onDelete={handleDelete} />
      
      <CardForm
        open={openDialog}
        editingCard={editingCard}
        staff={staff}
        vehicles={vehicles}
        submitting={submitting}
        formData={formData}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      <ConfirmDialog
        open={openConfirmDialog}
        title="Delete Card"
        message={`Are you sure you want to delete card ${cardToDelete?.uid}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleting}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
