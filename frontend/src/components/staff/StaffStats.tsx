import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { People, PersonAdd, Business, TrendingUp } from '@mui/icons-material';

interface StaffStatsProps {
  stats: {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    departmentCount: number;
  };
}

export default function StaffStats({ stats }: StaffStatsProps) {
  const statCards = [
    {
      title: 'Total Staff',
      value: stats.totalStaff,
      icon: People,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff,
      icon: PersonAdd,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Inactive Staff',
      value: stats.inactiveStaff,
      icon: TrendingUp,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: 'Departments',
      value: stats.departmentCount,
      icon: Business,
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
