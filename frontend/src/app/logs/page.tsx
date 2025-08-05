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

interface ActivityStatsData {
  totalToday: number;
  successfulToday: number;
  failedToday: number;
  uniqueUsersToday: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStatsData>({
    totalToday: 0,
    successfulToday: 0,
    failedToday: 0,
    uniqueUsersToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    accessGranted: 'all',
    cardType: 'all',
    dateFrom: '',
    dateTo: '',
    readerId: '',
  });

  const logsPerPage = 20;

  useEffect(() => {
    void fetchData();
  }, [currentPage, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: logsPerPage.toString(),
        offset: ((currentPage - 1) * logsPerPage).toString(),
        timezone: getTimeZone(),
      });

      // Map frontend filters to backend parameters
      if (filters.search) params.append('search', filters.search);
      if (filters.accessGranted !== 'all') params.append('access_granted', filters.accessGranted);
      if (filters.cardType !== 'all') params.append('card_type', filters.cardType);
      if (filters.readerId) params.append('reader_id', filters.readerId);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        params.append('date_from', formatDateWithTimezone(fromDate));
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        params.append('date_to', formatDateWithTimezone(toDate));
      }

      console.log('Fetching logs with params:', params.toString());
      const response = await fetch(`/api/rfid/logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching logs: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Received logs response:', result);

      const { data, total, page, totalPages } = result;
      setLogs(data || []);
      setTotalRecords(total || 0);
      setCurrentPage(page || 1);
      setTotalPages(totalPages || 1);
      setError(null);

      // Fetch stats with timezone
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // For IST, we need to adjust the date range to account for UTC offset
      // IST is UTC+5:30, so we need to start 5:30 hours before IST midnight
      const timezone = getTimeZone();
      if (timezone === 'IST') {
        today.setHours(-5, -30, 0, 0);  // Start at previous day 18:30 UTC
        now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + 330); // Convert to IST
      }

      const statsParams = new URLSearchParams({
        date_from: formatDateWithTimezone(today),
        date_to: formatDateWithTimezone(now),
        timezone: timezone,
      });

      console.log('Fetching stats with params:', {
        dateFrom: formatDateWithTimezone(today),
        dateTo: formatDateWithTimezone(now),
        timezone: timezone,
        url: `/api/rfid/stats?${statsParams.toString()}`
      });

      const statsResponse = await fetch(`/api/rfid/stats?${statsParams.toString()}`);
      const responseText = await statsResponse.text();
      console.log('Raw stats response:', responseText);
      
      try {
        const statsData = JSON.parse(responseText);
        console.log('Parsed stats data:', statsData);
        if (statsResponse.ok) {
          setStats({
            totalToday: statsData.totalToday || 0,
            successfulToday: statsData.successfulToday || 0,
            failedToday: statsData.failedToday || 0,
            uniqueUsersToday: statsData.uniqueUsersToday || 0,
          });
        } else {
          console.error('Stats response not OK:', statsResponse.status, statsResponse.statusText);
        }
      } catch (err) {
        console.error('Error parsing stats response:', err);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      accessGranted: 'all',
      cardType: 'all',
      dateFrom: '',
      dateTo: '',
      readerId: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && logs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Activity Logs
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <ActivityStats stats={stats} />
      <ActivityFilters filters={filters} onFilterChange={handleFilterChange} />      <ActivityTable
        logs={logs}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />
    </Box>
  );
}