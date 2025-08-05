import {
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { CheckCircle, Cancel, Person, DirectionsCar } from '@mui/icons-material';

interface ActivityLog {
  id: number;
  card_uid: string;
  reader_id: string;
  is_authorized: boolean;
  timestamp: string;
  tenant_id: number;
  card?: {
    card_uid: string;
    card_type: 'staff' | 'vehicle';
    staff?: {
      id: number;
      first_name: string;
      last_name: string;
      employee_id: string;
    };
    vehicle?: {
      id: number;
      license_plate: string;
      make: string;
      model: string;
    };
  };
  reader?: {
    reader_id: string;
    name: string;
    location: string;
  };
}

interface LogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  totalPages: number;
}

interface ActivityTableProps {
  logs: ActivityLog[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export default function ActivityTable({ 
  logs, 
  loading, 
  currentPage, 
  totalPages,
  totalRecords, 
  onPageChange 
}: ActivityTableProps) {
  const getAccessStatusChip = (granted: boolean) => (
    <Chip
      label={granted ? 'Granted' : 'Denied'}
      color={granted ? 'success' : 'error'}
      size="small"
      icon={granted ? <CheckCircle /> : <Cancel />}
    />
  );

  const getCardTypeChip = (type: 'staff' | 'vehicle') => (
    <Chip
      label={type}
      color={type === 'staff' ? 'primary' : 'secondary'}
      size="small"
      icon={type === 'staff' ? <Person /> : <DirectionsCar />}
    />
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Activity Logs ({totalRecords.toLocaleString()} records)
          </Typography>
          {loading && <CircularProgress size={24} />}
        </Box>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Card UID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>User/Vehicle</TableCell>
                <TableCell>Reader</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No activity logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: ActivityLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getAccessStatusChip(log.is_authorized)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.card_uid}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.card?.card_type && getCardTypeChip(log.card.card_type)}
                    </TableCell>
                    <TableCell>
                      {log.card?.staff ? (
                        <Box>
                          <Typography variant="body2">
                            {`${log.card.staff.first_name} ${log.card.staff.last_name}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {log.card.staff.employee_id}
                          </Typography>
                        </Box>
                      ) : log.card?.vehicle ? (
                        <Box>
                          <Typography variant="body2">{log.card.vehicle.license_plate}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.card.vehicle.make} {log.card.vehicle.model}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unknown
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.reader?.name || log.reader_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.reader?.location || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => onPageChange(page)}
              color="primary"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
