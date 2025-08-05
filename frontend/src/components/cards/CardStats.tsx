import { Grid, Card, CardContent, Typography } from '@mui/material';
import { CreditCard, Person, DirectionsCar } from '@mui/icons-material';

interface CardStats {
  totalCards: number;
  activeCards: number;
  staffCards: number;
  vehicleCards: number;
  assignedCards: number;
}

interface CardStatsProps {
  stats: CardStats;
}

export default function CardStats({ stats }: CardStatsProps) {
  return (
    <Grid container spacing={3} mb={3}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CreditCard color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalCards}</Typography>
            <Typography color="text.secondary">Total Cards</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">{stats.activeCards}</Typography>
            <Typography color="text.secondary">Active Cards</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Person color="primary" sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="h4">{stats.staffCards}</Typography>
            <Typography color="text.secondary">Staff Cards</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <DirectionsCar color="primary" sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="h4">{stats.vehicleCards}</Typography>
            <Typography color="text.secondary">Vehicle Cards</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">{stats.assignedCards}</Typography>
            <Typography color="text.secondary">Assigned Cards</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
