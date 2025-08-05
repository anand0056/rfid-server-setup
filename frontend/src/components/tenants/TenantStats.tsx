'use client';

import { Paper, Grid, Typography, Box } from '@mui/material';
import { Business, People, DirectionsCar, CreditCard } from '@mui/icons-material';

interface TenantStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export default function TenantStats({ stats }: TenantStatsProps) {
  const statItems = [
    {
      label: 'Total Tenants',
      value: stats.total,
      icon: <Business />,
      color: '#1976d2',
    },
    {
      label: 'Active Tenants',
      value: stats.active,
      icon: <Business />,
      color: '#2e7d32',
    },
    {
      label: 'Inactive Tenants',
      value: stats.inactive,
      icon: <Business />,
      color: '#d32f2f',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {statItems.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: `${item.color}20`,
                color: item.color,
                mr: 2,
              }}
            >
              {item.icon}
            </Box>
            <Box>
              <Typography variant="h4" component="div">
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
