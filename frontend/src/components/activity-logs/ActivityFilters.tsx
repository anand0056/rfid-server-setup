import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface ActivityFiltersProps {
  filters: {
    search: string;
    accessGranted: string;
    cardType: string;
    dateFrom: string;
    dateTo: string;
    readerId: string;
  };
  onFilterChange: (field: string, value: string) => void;
}

export default function ActivityFilters({ filters, onFilterChange }: ActivityFiltersProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by card UID, name, or license plate"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Access Status</InputLabel>
              <Select
                value={filters.accessGranted}
                label="Access Status"
                onChange={(e) => onFilterChange('accessGranted', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Granted</MenuItem>
                <MenuItem value="false">Denied</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Card Type</InputLabel>
              <Select
                value={filters.cardType}
                label="Card Type"
                onChange={(e) => onFilterChange('cardType', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
