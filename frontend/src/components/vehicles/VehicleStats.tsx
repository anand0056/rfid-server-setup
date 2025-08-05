import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { DirectionsCar, CarRepair, LocalParking, TrendingUp } from '@mui/icons-material';

interface VehicleStatsProps {
  stats: {
    totalVehicles: number;
    activeVehicles: number;
    inactiveVehicles: number;
    vehicleTypes: number;
  };
}

export default function VehicleStats({ stats }: VehicleStatsProps) {
  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: DirectionsCar,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Active Vehicles',
      value: stats.activeVehicles,
      icon: LocalParking,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Inactive Vehicles',
      value: stats.inactiveVehicles,
      icon: CarRepair,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: 'Vehicle Types',
      value: stats.vehicleTypes,
      icon: TrendingUp,
      color: 'info.main',
      bgColor: 'info.light',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.bgColor,
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
