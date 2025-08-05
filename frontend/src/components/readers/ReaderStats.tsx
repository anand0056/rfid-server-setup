import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Router, CheckCircle, Cancel, LocationOn } from '@mui/icons-material';

interface ReaderStatsProps {
  stats: {
    totalReaders: number;
    onlineReaders: number;
    offlineReaders: number;
    maintenanceReaders: number;
  };
}

export default function ReaderStats({ stats }: ReaderStatsProps) {
  return (
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
  );
}
