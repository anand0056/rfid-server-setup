import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Timeline, CheckCircle, Cancel, Person } from '@mui/icons-material';

interface ActivityStatsProps {
  stats: {
    totalToday: number;
    successfulToday: number;
    failedToday: number;
    uniqueUsersToday: number;
  };
}

export default function ActivityStats({ stats }: ActivityStatsProps) {
  return (
    <Grid container spacing={3} mb={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Timeline color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalToday}</Typography>
            <Typography color="text.secondary">Total Today</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="success.main">{stats.successfulToday}</Typography>
            <Typography color="text.secondary">Successful</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Cancel color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="error.main">{stats.failedToday}</Typography>
            <Typography color="text.secondary">Failed</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Person color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="info.main">{stats.uniqueUsersToday}</Typography>
            <Typography color="text.secondary">Unique Users</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
