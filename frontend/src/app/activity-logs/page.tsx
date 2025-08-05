'use client';

import { useState, useEffect, SetStateAction } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import ActivityStats from '@/components/activity-logs/ActivityStats';
import ActivityFilters from '@/components/activity-logs/ActivityFilters';
import ActivityTable from '@/components/activity-logs/ActivityTable';
import { getTimeZone, formatDateWithTimezone } from '@/utils/timezone';
import { BACKEND_API_URL } from '@/flavours/apiConfig';

const logsPerPage = 20;

const defaultFilters = {
  search: '',
  accessGranted: 'all',
  cardType: 'all',
  dateFrom: '',
  dateTo: '',
  readerId: '',
};

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    successfulToday: 0,
    failedToday: 0,
    uniqueUsersToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: logsPerPage.toString(),
          offset: ((currentPage - 1) * logsPerPage).toString(),
          timezone: getTimeZone(),
        });
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
        const response = await fetch(`${BACKEND_API_URL}/api/rfid/logs?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        const result = await response.json();
        setLogs(result.data || []);
        setTotalRecords(result.total || 0);
        setCurrentPage(result.page || 1);
        setTotalPages(result.totalPages || 1);
        setError(null);

        // Fetch stats
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timezone = getTimeZone();
        const statsParams = new URLSearchParams({
          date_from: formatDateWithTimezone(today),
          date_to: formatDateWithTimezone(now),
          timezone,
        });
        const statsResponse = await fetch(`${BACKEND_API_URL}/api/rfid/stats?${statsParams.toString()}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalToday: statsData.totalToday || 0,
            successfulToday: statsData.successfulToday || 0,
            failedToday: statsData.failedToday || 0,
            uniqueUsersToday: statsData.uniqueUsersToday || 0,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, currentPage]);

  const handleFilterChange = (field: any, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: SetStateAction<number>) => {
    setCurrentPage(page);
  };

  if (loading && logs.length === 0) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Activity Logs
      </Typography>
      <ActivityFilters filters={filters} onFilterChange={handleFilterChange} />
      <ActivityStats stats={stats} />
      <ActivityTable
        logs={logs}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />
    </Box>
  );
};

export default ActivityLogsPage;
