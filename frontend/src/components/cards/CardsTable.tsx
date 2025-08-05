import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
  tenant?: {
    id: number;
    name: string;
  };
}

interface CardsTableProps {
  cards: RfidCard[];
  onEdit: (card: RfidCard) => void;
  onDelete: (card: RfidCard) => void;
}

export default function CardsTable({ cards, onEdit, onDelete }: CardsTableProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          All RFID Cards
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Card UID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.uid}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {card.uid}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={card.card_type}
                      color={card.card_type === 'staff' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {card.tenant?.name || `Tenant ${card.tenant_id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={card.is_active ? 'Active' : 'Inactive'}
                      color={card.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {card.staff ? (
                      <Box>
                        <Typography variant="body2">{card.staff.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {card.staff.employee_id}
                        </Typography>
                      </Box>
                    ) : card.vehicle ? (
                      <Box>
                        <Typography variant="body2">{card.vehicle.license_plate}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {card.vehicle.make} {card.vehicle.model}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(card.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onEdit(card)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(card)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
