'use client';

import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import axios from 'axios';

interface DeviceStats {
  cards: {
    total: number;
    active: number;
    inactive: number;
    vehicles: number;
  };
  readers: {
    total: number;
    online: number;
    offline: number;
  };
  scans: {
    today: number;
    lastHour: number;
  };
}

interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  department?: string;
  position?: string;
}

interface Vehicle {
  id: number;
  license_plate: string;
  vehicle_type: string;
  make?: string;
  model?: string;
  owner_name?: string;
}

interface RfidCard {
  id: number;
  card_uid: string;
  card_type: 'staff' | 'vehicle' | 'visitor' | 'guest';
  staff?: Staff;
  vehicle?: Vehicle;
  description?: string;
  is_active: boolean;
}

interface RecentActivity {
  id: number;
  card_uid: string;
  card?: RfidCard;
  reader_id: string;
  reader?: {
    name: string;
    location: string;
  };
  event_type: string;
  is_authorized: boolean;
  timestamp: string;
  notes?: string;
}

export default function DashboardPage() {
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    cards: { total: 0, active: 0, inactive: 0, vehicles: 0 },
    readers: { total: 0, online: 0, offline: 0 },
    scans: { today: 0, lastHour: 0 },
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axios.get(`/api/rfid/stats`),
          axios.get(`/api/rfid/activity/recent?limit=10`)
        ]);
        
        setDeviceStats(statsRes.data);
        setRecentActivity(activityRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventTypeColor = (eventType: string, isAuthorized: boolean): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    if (!isAuthorized) return 'error';
    switch (eventType) {
      case 'entry': return 'success';
      case 'exit': return 'info';
      case 'scan': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        RFID Access Control Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6">RFID Cards</Typography>
              <Typography variant="h4">{deviceStats.cards.total}</Typography>
              <Typography variant="body2" color="textSecondary">
                {deviceStats.cards.active} Active, {deviceStats.cards.inactive} Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h6">RFID Readers</Typography>
              <Typography variant="h4">{deviceStats.readers.total}</Typography>
              <Typography variant="body2" color="textSecondary">
                {deviceStats.readers.online} Online, {deviceStats.readers.offline} Offline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6">Vehicle Cards</Typography>
              <Typography variant="h4">{deviceStats.cards.vehicles}</Typography>
              <Typography variant="body2" color="textSecondary">
                FASTag & Vehicle Access
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h6">Today&apos;s Scans</Typography>
              <Typography variant="h4">{deviceStats.scans.today}</Typography>
              <Typography variant="body2" color="textSecondary">
                {deviceStats.scans.lastHour} in last hour
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6">System Status</Typography>
              <Typography variant="h4" color="success.main">
                {deviceStats.readers.online > 0 ? 'Online' : 'Offline'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {deviceStats.readers.online}/{deviceStats.readers.total} Readers Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent RFID Activity
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Card UID</TableCell>
                  <TableCell>Card Holder / Vehicle</TableCell>
                  <TableCell>Reader</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No recent activity found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{formatTimestamp(activity.timestamp)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {activity.card_uid}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {activity.card?.card_type === 'vehicle' ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {activity.card.vehicle?.license_plate}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {activity.card.vehicle?.make} {activity.card.vehicle?.model}
                          </Typography>
                          {activity.card.vehicle?.owner_name && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Owner: {activity.card.vehicle.owner_name}
                            </Typography>
                          )}
                        </Box>
                      ) : activity.card?.card_type === 'staff' ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {activity.card.staff?.first_name} {activity.card.staff?.last_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {activity.card.staff?.employee_id}
                          </Typography>
                          {activity.card.staff?.department && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              {activity.card.staff.department}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2">
                          {activity.card?.card_type ? 
                            activity.card.card_type.charAt(0).toUpperCase() + activity.card.card_type.slice(1) 
                            : 'Unknown'}
                        </Typography>
                      )}
                      {activity.card?.card_type && (
                        <Chip 
                          label={activity.card.card_type} 
                          size="small" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                          color={activity.card.card_type === 'vehicle' ? 'primary' : 'default'}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.reader?.name || activity.reader_id}
                      </Typography>
                      {activity.reader?.location && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {activity.reader.location}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.event_type}
                        size="small"
                        color={getEventTypeColor(activity.event_type, activity.is_authorized)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.is_authorized ? 'Authorized' : 'Denied'}
                        size="small"
                        color={activity.is_authorized ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {activity.notes || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
