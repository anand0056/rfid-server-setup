'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import ActivityStats from '../../components/logs/ActivityStats';
import ActivityFilters from '../../components/logs/ActivityFilters';
import ActivityTable from '../../components/logs/ActivityTable';
import { getTimeZone, formatDateWithTimezone } from '../../utils/timezone';
import { BACKEND_API_URL } from '../../flavours/apiConfig';

const ActivityLogsPage = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const fetchActivityLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_API_URL}/activity-logs`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setActivityLogs(data);
        setFilteredLogs(data);
        setTimezone(getTimeZone());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, []);

  const handleFilterChange = (filters) => {
    const { dateRange, user, actionType } = filters;

    let filtered = activityLogs;

    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        return (
          logDate >= dateRange[0] && logDate <= dateRange[1]
        );
      });
    }

    if (user) {
      filtered = filtered.filter((log) => log.user === user);
    }

    if (actionType) {
      filtered = filtered.filter((log) => log.actionType === actionType);
    }

    setFilteredLogs(filtered);
  };

  const handleExport = () => {
    // Implement export functionality
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Activity Logs
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleExport}
        startIcon={<FilterList />}
        sx={{ mb: 2 }}
      >
        Export Logs
      </Button>
      <ActivityFilters onFilterChange={handleFilterChange} />
      <ActivityStats logs={filteredLogs} timezone={timezone} />
      <ActivityTable logs={filteredLogs} />
    </Box>
  );
};

export default ActivityLogsPage;
