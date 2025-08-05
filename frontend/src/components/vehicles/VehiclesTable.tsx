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
  tenant?: {
    id: number;
    name: string;
  };
}

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export default function VehiclesTable({ vehicles, onEdit, onDelete }: VehiclesTableProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          All Vehicles
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>License Plate</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                      {vehicle.license_plate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {vehicle.make} {vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vehicle.year} • {vehicle.color} • {vehicle.vehicle_type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {vehicle.tenant?.name || `Tenant ${vehicle.tenant_id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.owner_name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {vehicle.owner_phone && (
                        <Typography variant="body2">{vehicle.owner_phone}</Typography>
                      )}
                      {vehicle.owner_email && (
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.owner_email}
                        </Typography>
                      )}
                      {!vehicle.owner_phone && !vehicle.owner_email && (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {vehicle.registration_date && (
                        <Typography variant="body2">
                          Reg: {new Date(vehicle.registration_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {vehicle.insurance_expiry && (
                        <Typography variant="caption" color="text.secondary">
                          Ins: {new Date(vehicle.insurance_expiry).toLocaleDateString()}
                        </Typography>
                      )}
                      {!vehicle.registration_date && !vehicle.insurance_expiry && (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={vehicle.is_active ? 'Active' : 'Inactive'}
                      color={vehicle.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onEdit(vehicle)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(vehicle)}
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
